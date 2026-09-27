/**
 * OMEGA V16 — Safe Deterministic Threat Hunting Query Engine
 * Parses and evaluates hunting query expressions against normalized telemetry.
 * Safe AST execution without eval() or arbitrary code execution.
 */

import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { QueryAST, QueryCondition, QueryGroup, QueryResult } from './types';

export interface ParseResult {
  ast: QueryAST | null;
  error?: string;
}

export class ThreatHuntQueryEngine {
  /**
   * Tokenizes a raw query string safely into structured tokens
   */
  public static tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if ((char === '"' || char === "'") && (!inQuotes || char === quoteChar)) {
        inQuotes = !inQuotes;
        quoteChar = inQuotes ? char : '';
        current += char;
        continue;
      }

      if (inQuotes) {
        current += char;
        continue;
      }

      if (char === '(' || char === ')' || char === ',') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        tokens.push(char);
      } else if (/\s/.test(char)) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (inQuotes) {
      throw new Error('Unclosed quote in query string');
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens;
  }

  /**
   * Parses token stream into a QueryAST
   */
  public static parse(queryString: string): ParseResult {
    const trimmed = queryString.trim();
    if (!trimmed) {
      return {
        ast: {
          root: { logical: 'AND', conditions: [] },
          rawQueryString: '',
        },
      };
    }

    try {
      const tokens = this.tokenize(trimmed);
      let index = 0;

      const parseGroup = (stopAtParen = false): QueryGroup => {
        const group: QueryGroup = { logical: 'AND', conditions: [] };
        let currentLogical: 'AND' | 'OR' = 'AND';

        while (index < tokens.length) {
          const token = tokens[index];

          if (token === ')') {
            if (stopAtParen) {
              index++; // consume ')'
              return group;
            }
            throw new Error(`Unexpected closing parenthesis ')' at position ${index}`);
          }

          if (token.toUpperCase() === 'AND') {
            currentLogical = 'AND';
            group.logical = 'AND';
            index++;
            continue;
          }

          if (token.toUpperCase() === 'OR') {
            currentLogical = 'OR';
            group.logical = 'OR';
            index++;
            continue;
          }

          if (token === '(') {
            index++;
            const nestedGroup = parseGroup(true);
            group.conditions.push(nestedGroup);
            continue;
          }

          // Helper to parse condition
          const parseCondition = (field: string, opToken: string): QueryCondition => {
            let actualOp = opToken;
            let isInverted = false;

            if (opToken === 'NOT') {
              if (index >= tokens.length) {
                throw new Error(`Incomplete condition after NOT for field '${field}': missing operator`);
              }
              actualOp = tokens[index].toUpperCase();
              index++;
              isInverted = true;
            }

            if (actualOp === 'BETWEEN') {
              if (index >= tokens.length) {
                throw new Error(`Malformed BETWEEN for field '${field}': expected start value`);
              }
              const startValStr = tokens[index];
              index++;

              if (index >= tokens.length || tokens[index].toUpperCase() !== 'AND') {
                throw new Error(`Malformed BETWEEN for field '${field}': expected 'AND' separator`);
              }
              index++; // consume 'AND'

              if (index >= tokens.length) {
                throw new Error(`Malformed BETWEEN for field '${field}': expected end value`);
              }
              const endValStr = tokens[index];
              index++;

              const startNum = Number(startValStr.replace(/['"]/g, ''));
              const endNum = Number(endValStr.replace(/['"]/g, ''));

              if (isNaN(startNum) || isNaN(endNum)) {
                throw new Error(`BETWEEN requires numeric boundaries for field '${field}'`);
              }

              return {
                field,
                operator: 'BETWEEN',
                value: [startNum, endNum],
                inverted: isInverted ? true : undefined,
              };
            }

            if (actualOp === 'IN') {
              if (index >= tokens.length || tokens[index] !== '(') {
                throw new Error(`Expected '(' after IN operator for field '${field}'`);
              }
              index++; // consume '('

              const inValues: string[] = [];
              while (index < tokens.length && tokens[index] !== ')') {
                if (tokens[index] === ',') {
                  index++;
                  continue;
                }
                const cleanVal = tokens[index].replace(/^['"]|['"]$/g, '');
                inValues.push(cleanVal);
                index++;
              }

              if (index >= tokens.length || tokens[index] !== ')') {
                throw new Error(`Unclosed parenthesis in IN list for field '${field}'`);
              }
              index++; // consume ')'

              return {
                field,
                operator: 'IN',
                value: inValues,
                inverted: isInverted ? true : undefined,
              };
            }

            if (['=', '!=', 'CONTAINS', '>', '<', '>=', '<='].includes(actualOp)) {
              if (index >= tokens.length) {
                throw new Error(`Missing value after operator '${actualOp}' for field '${field}'`);
              }
              const rawVal = tokens[index];
              index++;

              const cleanVal = rawVal.replace(/^['"]|['"]$/g, '');
              const numVal = Number(cleanVal);
              const finalVal = !isNaN(numVal) && cleanVal !== '' && !rawVal.startsWith('"') && !rawVal.startsWith("'")
                ? numVal
                : cleanVal;

              return {
                field,
                operator: actualOp as any,
                value: finalVal,
                inverted: isInverted ? true : undefined,
              };
            }

            throw new Error(`Unknown operator '${actualOp}' for field '${field}'`);
          };

          if (token.toUpperCase() === 'NOT') {
            index++; // consume 'NOT'
            if (index >= tokens.length) {
              throw new Error("Unexpected end of query after 'NOT'");
            }
            if (tokens[index] === '(') {
              index++; // consume '('
              const nestedGroup = parseGroup(true);
              nestedGroup.inverted = true;
              group.conditions.push(nestedGroup);
              continue;
            } else {
              // Parse single inverted condition: NOT field operator value
              const field = tokens[index];
              index++;
              if (index >= tokens.length) {
                throw new Error(`Incomplete condition for field '${field}' after NOT: missing operator`);
              }
              const opToken = tokens[index].toUpperCase();
              index++;
              const condition = parseCondition(field, opToken);
              condition.inverted = true;
              group.conditions.push(condition);
              continue;
            }
          }

          const field = token;
          index++;

          if (index >= tokens.length) {
            throw new Error(`Incomplete condition for field '${field}': missing operator`);
          }

          const opToken = tokens[index].toUpperCase();
          index++;

          const cond = parseCondition(field, opToken);
          group.conditions.push(cond);
          continue;
        }

        return group;
      };

      const root = parseGroup(false);
      return {
        ast: {
          root,
          rawQueryString: trimmed,
        },
      };
    } catch (err: any) {
      return {
        ast: null,
        error: err.message || 'Syntax error in threat hunting query',
      };
    }
  }

  /**
   * Evaluates a single event against a condition
   */
  public static evaluateCondition(event: SecurityTelemetryEvent, condition: QueryCondition): boolean {
    const { field, operator, value } = condition;

    let eventVal: any;
    const lowerField = field.toLowerCase();

    if (lowerField === 'sourceworld' || lowerField === 'world') eventVal = event.sourceWorld;
    else if (lowerField === 'eventtype' || lowerField === 'type') eventVal = event.eventType;
    else if (lowerField === 'user' || lowerField === 'username' || lowerField === 'actor') eventVal = event.user;
    else if (lowerField === 'host' || lowerField === 'hostname' || lowerField === 'workstation') eventVal = event.host;
    else if (lowerField === 'sourceip' || lowerField === 'srcip' || lowerField === 'ip') eventVal = event.sourceIp;
    else if (lowerField === 'destinationip' || lowerField === 'dstip') eventVal = event.destinationIp;
    else if (lowerField === 'destinationport' || lowerField === 'port' || lowerField === 'dstport') eventVal = event.destinationPort;
    else if (lowerField === 'process') eventVal = event.process;
    else if (lowerField === 'parentprocess') eventVal = event.parentProcess;
    else if (lowerField === 'service') eventVal = event.service;
    else if (lowerField === 'resource') eventVal = event.resource;
    else if (lowerField === 'severity') eventVal = event.severity;
    else if (lowerField === 'category') eventVal = event.category;
    else if (lowerField === 'outcome') eventVal = event.outcome;
    else if (lowerField === 'virtualtime' || lowerField === 'time') eventVal = event.virtualTime;
    else if (lowerField === 'raweventid' || lowerField === 'id') eventVal = event.rawEventId || event.id;
    else {
      // Check attributes dictionary
      eventVal = event.attributes ? event.attributes[field] || event.attributes[lowerField] : undefined;
    }

    let match = false;
    if (eventVal === undefined || eventVal === null) {
      if (operator === '!=') match = true;
      else match = false;
    } else {
      const strEventVal = String(eventVal).toLowerCase();

      switch (operator) {
        case '=':
          match = typeof value === 'number'
            ? Number(eventVal) === Number(value)
            : strEventVal === String(value).toLowerCase();
          break;

        case '!=':
          match = typeof value === 'number'
            ? Number(eventVal) !== Number(value)
            : strEventVal !== String(value).toLowerCase();
          break;

        case 'CONTAINS':
          match = strEventVal.includes(String(value).toLowerCase());
          break;

        case 'IN': {
          if (!Array.isArray(value)) match = false;
          else {
            const normalizedIn = value.map((v) => String(v).toLowerCase());
            match = normalizedIn.includes(strEventVal);
          }
          break;
        }

        case 'BETWEEN': {
          if (!Array.isArray(value) || value.length !== 2) match = false;
          else {
            const num = Number(eventVal);
            const [low, high] = value.map(Number);
            match = !isNaN(num) && !isNaN(low) && !isNaN(high) && num >= low && num <= high;
          }
          break;
        }

        case '>':
          match = Number(eventVal) > Number(value);
          break;

        case '<':
          match = Number(eventVal) < Number(value);
          break;

        case '>=':
          match = Number(eventVal) >= Number(value);
          break;

        case '<=':
          match = Number(eventVal) <= Number(value);
          break;

        default:
          match = false;
          break;
      }
    }

    return condition.inverted ? !match : match;
  }

  /**
   * Recursively evaluates a QueryGroup
   */
  public static evaluateGroup(event: SecurityTelemetryEvent, group: QueryGroup): boolean {
    if (!group.conditions || group.conditions.length === 0) {
      return group.inverted ? false : true;
    }

    let groupResult: boolean;
    if (group.logical === 'OR') {
      groupResult = group.conditions.some((child) => {
        if ('logical' in child) {
          return this.evaluateGroup(event, child as QueryGroup);
        }
        return this.evaluateCondition(event, child as QueryCondition);
      });
    } else {
      groupResult = group.conditions.every((child) => {
        if ('logical' in child) {
          return this.evaluateGroup(event, child as QueryGroup);
        }
        return this.evaluateCondition(event, child as QueryCondition);
      });
    }

    return group.inverted ? !groupResult : groupResult;
  }

  /**
   * Executes a parsed AST or raw query against an array of telemetry events
   */
  public static execute(
    queryOrString: string | QueryAST,
    events: SecurityTelemetryEvent[],
    virtualTime: number = 0
  ): QueryResult {
    let ast: QueryAST | null = null;
    let queryString = '';

    if (typeof queryOrString === 'string') {
      queryString = queryOrString;
      const parseRes = this.parse(queryOrString);
      if (parseRes.error || !parseRes.ast) {
        return {
          queryId: `HQUERY-${virtualTime}`,
          queryString,
          executedAtVirtualTime: virtualTime,
          matchedCount: 0,
          events: [],
          matchedEventIds: [],
          executionTimeVirtualMs: 0,
          fieldsUsed: [],
          error: parseRes.error || 'Failed to parse query',
        };
      }
      ast = parseRes.ast;
    } else {
      ast = queryOrString;
      queryString = ast.rawQueryString;
    }

    // Collect all fields used
    const fieldsUsed: Set<string> = new Set();
    const collectFields = (group: QueryGroup) => {
      group.conditions.forEach((c) => {
        if ('logical' in c) {
          collectFields(c as QueryGroup);
        } else {
          fieldsUsed.add((c as QueryCondition).field);
        }
      });
    };
    collectFields(ast.root);

    const matchedEvents = events.filter((e) => this.evaluateGroup(e, ast!.root));
    const matchedIds = matchedEvents.map((e) => e.id);

    return {
      queryId: `HQUERY-${virtualTime}-${matchedEvents.length}`,
      queryString,
      executedAtVirtualTime: virtualTime,
      matchedCount: matchedEvents.length,
      events: matchedEvents,
      matchedEventIds: matchedIds,
      executionTimeVirtualMs: Math.max(1, Math.min(45, matchedEvents.length * 2)),
      fieldsUsed: Array.from(fieldsUsed),
    };
  }
}
