import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { StageCanvas } from '../../components/simulation/StageCanvas';
import { SimulationNode, Packet, ConnectionLink, Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import { Globe, Server, Database, Play, CheckCircle2, FileText, Send, ArrowRight } from 'lucide-react';

export const HttpSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [endpoint, setEndpoint] = useState('/api/users/profile');
  const [simulateDbError, setSimulateDbError] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);

  const [packets, setPackets] = useState<Packet[]>([]);
  const [activeStage, setActiveStage] = useState<'idle' | 'req_sent' | 'srv_processing' | 'db_query' | 'db_response' | 'res_sent' | 'done'>('idle');

  const nodes: SimulationNode[] = [
    {
      id: 'browser',
      name: language === 'ar' ? 'متصفح العميل' : 'Client Browser',
      type: 'client',
      ip: '192.168.1.15',
      status: 'online',
      position: { x: 15, y: 50 },
    },
    {
      id: 'web_server',
      name: language === 'ar' ? 'خادم الويب Nginx (بروكسي)' : 'Nginx Web Server',
      type: 'server',
      ip: '10.0.0.10',
      status: 'online',
      position: { x: 45, y: 50 },
      services: [{ name: 'Reverse Proxy', port: 443, protocol: 'TCP', status: 'running' }],
    },
    {
      id: 'app_worker',
      name: language === 'ar' ? 'خادم التطبيقات Node.js' : 'Node.js App Server',
      type: 'server',
      ip: '10.0.0.20',
      status: 'online',
      position: { x: 70, y: 30 },
      services: [{ name: 'Express API', port: 3000, protocol: 'TCP', status: 'running' }],
    },
    {
      id: 'database',
      name: language === 'ar' ? 'قاعدة بيانات PostgreSQL' : 'PostgreSQL DB',
      type: 'database',
      ip: '10.0.0.30',
      status: simulateDbError ? 'warning' : 'online',
      position: { x: 70, y: 70 },
      services: [{ name: 'Postgres', port: 5432, protocol: 'TCP', status: 'running' }],
    },
  ];

  const connections: ConnectionLink[] = [
    { id: 'c1', source: 'browser', target: 'web_server', label: language === 'ar' ? 'اتصال مشفر HTTPS' : 'HTTP/2 HTTPS' },
    { id: 'c2', source: 'web_server', target: 'app_worker', label: language === 'ar' ? 'توجيه البروكسي العكسي' : 'Reverse Proxy' },
    { id: 'c3', source: 'app_worker', target: 'database', label: language === 'ar' ? 'استعلام SQL (5432)' : 'TCP 5432 SQL' },
  ];

  const httpChallenge: Challenge = {
    id: 'http-lifecycle-mastery',
    simulationId: 'http',
    title: t.http.missionTitle,
    difficulty: 'Intermediate',
    category: t.http.missionCategory,
    mission: t.http.missionDesc,
    initialExplanation:
      language === 'ar'
        ? 'تفصل معمارية الويب الحديثة بين خادم المحيط الخارجي (Nginx) ومحرك كود التطبيق وقاعدة البيانات الخلفية لضمان الأمان وقابلية التوسع.'
        : 'Modern web apps decouple the edge web server (Nginx/Envoy), backend microservice runtime, and relational database.',
    objectives: [
      {
        id: 'obj-dispatch',
        title: t.http.objSend,
        description: t.http.objSendDesc,
        isCompleted: activeStage !== 'idle',
        validationKey: 'req_dispatched',
      },
      {
        id: 'obj-db-query',
        title: t.http.objDbQuery,
        description: t.http.objDbQueryDesc,
        isCompleted: activeStage === 'db_query' || activeStage === 'db_response' || activeStage === 'done',
        validationKey: 'db_queried',
      },
      {
        id: 'obj-response-200',
        title: t.http.obj200Ok,
        description: t.http.obj200OkDesc,
        isCompleted: responseStatus === 200,
        validationKey: 'res_200',
      },
    ],
    hints: [t.http.hint1],
  };

  const handleSendRequest = () => {
    setActiveStage('req_sent');
    setResponseStatus(null);
    setResponseBody(null);

    addLog({
      level: 'INFO',
      source: 'BROWSER',
      message: `${method} ${endpoint} HTTP/1.1`,
      category: 'NETWORK',
    });

    // Step 1: Browser -> Web Server
    setPackets([
      {
        id: 'pkt-req',
        source: 'browser',
        destination: 'web_server',
        protocol: 'HTTP',
        sourcePort: 51234,
        destinationPort: 443,
        label: `${method} ${endpoint}`,
        state: 'moving',
        progress: 0,
        timestamp: Date.now(),
      },
    ]);

    setTimeout(() => {
      // Step 2: Web Server -> App Worker
      setActiveStage('srv_processing');
      addLog({
        level: 'INFO',
        source: 'NGINX_PROXY',
        message: `Reverse proxy pass: ${method} ${endpoint} -> http://10.0.0.20:3000`,
        category: 'SYSTEM',
      });

      setPackets([
        {
          id: 'pkt-proxy',
          source: 'web_server',
          destination: 'app_worker',
          protocol: 'HTTP',
          sourcePort: 443,
          destinationPort: 3000,
          label: 'Proxy Pass',
          state: 'moving',
          progress: 0,
          timestamp: Date.now(),
        },
      ]);

      setTimeout(() => {
        // Step 3: App Worker -> Database
        setActiveStage('db_query');
        addLog({
          level: 'INFO',
          source: 'APP_WORKER',
          message: 'Executing parameterized SQL query: SELECT * FROM users WHERE id = $1 LIMIT 1',
          category: 'SYSTEM',
        });

        setPackets([
          {
            id: 'pkt-db',
            source: 'app_worker',
            destination: 'database',
            protocol: 'TCP',
            sourcePort: 3000,
            destinationPort: 5432,
            label: 'SQL Query',
            state: 'moving',
            progress: 0,
            timestamp: Date.now(),
          },
        ]);

        setTimeout(() => {
          if (simulateDbError) {
            // DB Error Simulation
            addLog({
              level: 'ERROR',
              source: 'DATABASE_POSTGRES',
              message: 'Connection pool timeout (ETIMEDOUT) - 5432 closed.',
              category: 'SYSTEM',
            });

            setTimeout(() => {
              setActiveStage('done');
              setResponseStatus(500);
              setResponseBody(
                JSON.stringify({ error: 'Database timeout', code: 'DB_CONNECTION_FAILED' }, null, 2)
              );
              setPackets([]);
            }, 1000 / clockSpeed);
          } else {
            // Step 4: DB -> App Worker
            setActiveStage('db_response');
            addLog({
              level: 'INFO',
              source: 'DATABASE_POSTGRES',
              message: 'Rows returned (1 record, 3.4ms query execution)',
              category: 'SYSTEM',
            });

            setPackets([
              {
                id: 'pkt-db-res',
                source: 'database',
                destination: 'app_worker',
                protocol: 'TCP',
                sourcePort: 5432,
                destinationPort: 3000,
                label: 'SQL Result',
                state: 'moving',
                progress: 0,
                timestamp: Date.now(),
              },
            ]);

            setTimeout(() => {
              // Step 5: Web Server -> Browser
              setPackets([
                {
                  id: 'pkt-final-res',
                  source: 'web_server',
                  destination: 'browser',
                  protocol: 'HTTP',
                  sourcePort: 443,
                  destinationPort: 51234,
                  label: 'HTTP 200 OK',
                  state: 'moving',
                  progress: 0,
                  timestamp: Date.now(),
                },
              ]);

              setTimeout(() => {
                setActiveStage('done');
                setResponseStatus(200);
                setResponseBody(
                  JSON.stringify(
                    { id: 'usr_8921', username: 'alice', role: 'security_analyst', authenticated: true },
                    null,
                    2
                  )
                );
                addLog({
                  level: 'INFO',
                  source: 'BROWSER',
                  message: 'HTTP/2 200 OK received (Content-Type: application/json, 142ms total latency)',
                  category: 'NETWORK',
                });
                setPackets([]);
              }, 1000 / clockSpeed);
            }, 1000 / clockSpeed);
          }
        }, 1500 / clockSpeed);
      }, 1200 / clockSpeed);
    }, 1200 / clockSpeed);
  };

  const validateChallenge = () => {
    if (responseStatus === 200) {
      return {
        success: true,
        message: t.http.valSuccess,
      };
    }
    return {
      success: false,
      message: t.http.valIncomplete,
    };
  };

  return (
    <Workspace
      title={t.http.title}
      subtitle={t.http.subtitle}
      challenge={httpChallenge}
      onValidateChallenge={validateChallenge}
      onRestart={() => {
        setPackets([]);
        setActiveStage('idle');
        setResponseStatus(null);
        setResponseBody(null);
      }}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-hidden"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-56 focus:outline-hidden"
            />
            <button
              onClick={handleSendRequest}
              disabled={activeStage !== 'idle' && activeStage !== 'done'}
              className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.http.sendRequest}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={simulateDbError}
                onChange={(e) => setSimulateDbError(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={simulateDbError ? 'text-rose-400 font-semibold' : ''}>
                {t.http.simulateDbError}
              </span>
            </label>
          </div>
        </div>
      }
    >
      {/* Response Drawer Overlay */}
      {responseStatus && (
        <div className="absolute top-4 right-6 rtl:right-auto rtl:left-6 z-20 pointer-events-auto">
          <div className="w-72 bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">{t.http.responseBody}</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                  responseStatus === 200
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {responseStatus} {responseStatus === 200 ? 'OK' : 'SERVER ERROR'}
              </span>
            </div>
            <pre className="text-[11px] font-mono p-2 bg-slate-900 border border-slate-800 rounded text-emerald-300 overflow-x-auto max-h-36">
              {responseBody}
            </pre>
          </div>
        </div>
      )}

      <StageCanvas nodes={nodes} connections={connections} packets={packets} />
    </Workspace>
  );
};
