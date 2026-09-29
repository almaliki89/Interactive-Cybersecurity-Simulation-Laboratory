/**
 * OMEGA ULTRA REALITY V1.4 — Windows RecycleBinEngine
 * Deterministic Recycle Bin tracking user file deletions, restores, and permanent purging.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { FileObject, RecycleBinItem } from './types';

export class RecycleBinEngine {
  private items: Map<string, RecycleBinItem> = new Map();
  private itemCounter: number = 100;

  public moveToRecycleBin(params: {
    file: FileObject;
    userSid: string;
    userName: string;
    vTime: number;
  }): RecycleBinItem {
    this.itemCounter += 1;
    const id = `bin-${params.file.id}-${this.itemCounter}`;
    const item: RecycleBinItem = {
      id,
      originalPath: params.file.fullPath,
      originalName: params.file.name,
      deletedAtVirtual: params.vTime,
      deletedByUserSid: params.userSid,
      deletedByUserName: params.userName,
      sizeBytes: params.file.sizeBytes,
      fileObject: {
        ...params.file,
        isDeleted: true,
        deletedAtVirtual: params.vTime,
        originalPathBeforeDelete: params.file.fullPath,
      },
    };
    this.items.set(id, item);
    return item;
  }

  public restoreItem(itemId: string): RecycleBinItem | undefined {
    const item = this.items.get(itemId);
    if (!item) return undefined;
    this.items.delete(itemId);
    return item;
  }

  public deletePermanently(itemId: string): boolean {
    return this.items.delete(itemId);
  }

  public emptyRecycleBin(userSid?: string): number {
    let count = 0;
    if (userSid) {
      for (const [id, item] of Array.from(this.items.entries())) {
        if (item.deletedByUserSid === userSid) {
          this.items.delete(id);
          count++;
        }
      }
    } else {
      count = this.items.size;
      this.items.clear();
    }
    return count;
  }

  public getItems(userSid?: string): RecycleBinItem[] {
    const list: RecycleBinItem[] = [];
    for (const item of this.items.values()) {
      if (!userSid || item.deletedByUserSid === userSid || item.deletedByUserSid === 'S-1-5-18') {
        list.push({ ...item, fileObject: { ...item.fileObject } });
      }
    }
    return list.sort((a, b) => b.deletedAtVirtual - a.deletedAtVirtual);
  }

  public exportSnapshot(): RecycleBinItem[] {
    return Array.from(this.items.values()).map((item) => ({
      ...item,
      fileObject: { ...item.fileObject },
    }));
  }

  public restoreSnapshot(data: RecycleBinItem[]): void {
    this.items.clear();
    for (const item of data) {
      this.items.set(item.id, {
        ...item,
        fileObject: { ...item.fileObject },
      });
    }
  }
}
