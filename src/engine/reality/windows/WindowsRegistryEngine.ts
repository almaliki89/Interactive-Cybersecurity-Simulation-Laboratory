/**
 * OMEGA ULTRA REALITY V1.4 — Windows Registry Engine
 * Deterministic in-memory hierarchical registry simulation for HKLM and HKCU.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

export interface RegistryValue {
  name: string;
  type: 'REG_SZ' | 'REG_DWORD' | 'REG_BINARY' | 'REG_MULTI_SZ' | 'REG_EXPAND_SZ';
  data: any;
}

export class WindowsRegistryEngine {
  private hklm: Map<string, Map<string, RegistryValue>> = new Map();
  private hkcu: Map<string, Map<string, RegistryValue>> = new Map();

  constructor() {
    this.initDefaultRegistry();
  }

  public initDefaultRegistry(): void {
    this.hklm.clear();
    this.hkcu.clear();

    // HKLM System Baseline
    this.setValue('HKLM', 'SYSTEM\\CurrentControlSet\\Control\\ComputerName\\ActiveComputerName', 'ComputerName', 'REG_SZ', 'HOST');
    this.setValue('HKLM', 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', 'ProductName', 'REG_SZ', 'Windows 11 Enterprise');
    this.setValue('HKLM', 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', 'CurrentBuild', 'REG_SZ', '26100');
    this.setValue('HKLM', 'SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters', 'NullSessionShares', 'REG_MULTI_SZ', []);
    this.setValue('HKLM', 'SYSTEM\\CurrentControlSet\\Services\\LanmanWorkstation\\Parameters', 'EnablePlainTextPassword', 'REG_DWORD', 0);
    this.setValue('HKLM', 'SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters', 'MaxCacheTtl', 'REG_DWORD', 86400);

    // HKCU Explorer Baseline
    this.setValue('HKCU', 'Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', 'Hidden', 'REG_DWORD', 1);
    this.setValue('HKCU', 'Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', 'ShowSuperHidden', 'REG_DWORD', 0);
    this.setValue('HKCU', 'Environment', 'TEMP', 'REG_EXPAND_SZ', '%USERPROFILE%\\AppData\\Local\\Temp');
    this.setValue('HKCU', 'Environment', 'TMP', 'REG_EXPAND_SZ', '%USERPROFILE%\\AppData\\Local\\Temp');
  }

  private normalizeKey(key: string): string {
    return key.replace(/\//g, '\\').trim().toUpperCase();
  }

  public setValue(
    hive: 'HKLM' | 'HKCU',
    keyPath: string,
    valueName: string,
    type: RegistryValue['type'],
    data: any
  ): void {
    const targetMap = hive === 'HKLM' ? this.hklm : this.hkcu;
    const normKey = this.normalizeKey(keyPath);
    if (!targetMap.has(normKey)) {
      targetMap.set(normKey, new Map());
    }
    targetMap.get(normKey)!.set(valueName, { name: valueName, type, data });
  }

  public getValue(
    hive: 'HKLM' | 'HKCU',
    keyPath: string,
    valueName: string
  ): RegistryValue | undefined {
    const targetMap = hive === 'HKLM' ? this.hklm : this.hkcu;
    const normKey = this.normalizeKey(keyPath);
    return targetMap.get(normKey)?.get(valueName);
  }

  public deleteValue(
    hive: 'HKLM' | 'HKCU',
    keyPath: string,
    valueName: string
  ): boolean {
    const targetMap = hive === 'HKLM' ? this.hklm : this.hkcu;
    const normKey = this.normalizeKey(keyPath);
    return targetMap.get(normKey)?.delete(valueName) || false;
  }

  public listValues(
    hive: 'HKLM' | 'HKCU',
    keyPath: string
  ): RegistryValue[] {
    const targetMap = hive === 'HKLM' ? this.hklm : this.hkcu;
    const normKey = this.normalizeKey(keyPath);
    const key = targetMap.get(normKey);
    if (!key) return [];
    return Array.from(key.values());
  }

  public listSubKeys(
    hive: 'HKLM' | 'HKCU',
    parentKeyPath: string
  ): string[] {
    const targetMap = hive === 'HKLM' ? this.hklm : this.hkcu;
    const normParent = this.normalizeKey(parentKeyPath);
    const prefix = normParent ? `${normParent}\\` : '';
    const results = new Set<string>();

    for (const key of targetMap.keys()) {
      if (key.startsWith(prefix) && key !== normParent) {
        const sub = key.slice(prefix.length).split('\\')[0];
        if (sub) results.add(sub);
      }
    }
    return Array.from(results);
  }

  public exportSnapshot(): { hklm: Record<string, any>; hkcu: Record<string, any> } {
    const exportHive = (map: Map<string, Map<string, RegistryValue>>) => {
      const res: Record<string, any> = {};
      for (const [k, vMap] of map.entries()) {
        res[k] = {};
        for (const [vName, vObj] of vMap.entries()) {
          res[k][vName] = { ...vObj };
        }
      }
      return res;
    };

    return {
      hklm: exportHive(this.hklm),
      hkcu: exportHive(this.hkcu),
    };
  }

  public restoreSnapshot(data: { hklm: Record<string, any>; hkcu: Record<string, any> }): void {
    const restoreHive = (target: Map<string, Map<string, RegistryValue>>, src: Record<string, any>) => {
      target.clear();
      for (const [k, vObj] of Object.entries(src)) {
        const vMap = new Map<string, RegistryValue>();
        for (const [vName, val] of Object.entries(vObj as Record<string, any>)) {
          vMap.set(vName, { ...(val as RegistryValue) });
        }
        target.set(k, vMap);
      }
    };

    restoreHive(this.hklm, data.hklm || {});
    restoreHive(this.hkcu, data.hkcu || {});
  }
}
