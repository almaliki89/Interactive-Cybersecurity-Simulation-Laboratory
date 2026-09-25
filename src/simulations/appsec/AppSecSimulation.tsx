import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { AppSecWorldMap } from './AppSecWorldMap';
import { HttpLifecycleLab } from './HttpLifecycleLab';
import { SessionSecurityLab } from './SessionSecurityLab';
import { AccessControlLab } from './AccessControlLab';
import { InputValidationLab } from './InputValidationLab';
import { SqlInjectionConceptLab } from './SqlInjectionConceptLab';
import { XssConceptLab } from './XssConceptLab';
import { CsrfLab } from './CsrfLab';
import { ApiSecurityLab } from './ApiSecurityLab';
import { JwtSecurityLab } from './JwtSecurityLab';
import { CorsLab } from './CorsLab';
import { FileUploadSecurityLab } from './FileUploadSecurityLab';
import { SecurityHeadersLab } from './SecurityHeadersLab';
import { RateLimitingLab } from './RateLimitingLab';
import { AppLoggingLab } from './AppLoggingLab';
import { SecureArchitectureLab } from './SecureArchitectureLab';
import { AppSecMasterChallenge } from './AppSecMasterChallenge';
import {
  Compass,
  Globe,
  Key,
  Lock,
  Sliders,
  Database,
  FileCode,
  ShieldCheck,
  Radio,
  FileCheck,
  Shield,
  Activity,
  Server,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export const AppSecSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [activeView, setActiveView] = useState<string>('map');

  const navItems = [
    { id: 'map', nameEn: 'World Map', nameAr: 'خارطة المنظومة', icon: Compass },
    { id: 'http_lifecycle', nameEn: 'HTTP Lifecycle', nameAr: 'دورة حياة HTTP', icon: Globe },
    { id: 'sessions', nameEn: 'Sessions', nameAr: 'الجلسات والكوكيز', icon: Key },
    { id: 'access_control', nameEn: 'Access Control', nameAr: 'التحكم بالوصول', icon: Lock },
    { id: 'validation', nameEn: 'Validation', nameAr: 'تدقيق المدخلات', icon: Sliders },
    { id: 'sqli', nameEn: 'SQL Injection', nameAr: 'حقن SQL', icon: Database },
    { id: 'xss', nameEn: 'XSS Defense', nameAr: 'حماية XSS', icon: FileCode },
    { id: 'csrf', nameEn: 'CSRF Defense', nameAr: 'حماية CSRF', icon: ShieldCheck },
    { id: 'api_security', nameEn: 'API Security', nameAr: 'أمن API', icon: Radio },
    { id: 'jwt', nameEn: 'JWT Tokens', nameAr: 'رموز JWT', icon: Key },
    { id: 'cors', nameEn: 'CORS Policy', nameAr: 'سياسات CORS', icon: Globe },
    { id: 'file_upload', nameEn: 'File Upload', nameAr: 'رفع الملفات', icon: FileCheck },
    { id: 'headers', nameEn: 'Security Headers', nameAr: 'الترويسات الأمنية', icon: Shield },
    { id: 'rate_limiting', nameEn: 'Rate Limiting', nameAr: 'تقييد المعدل', icon: Activity },
    { id: 'app_logging', nameEn: 'App Logging', nameAr: 'سجلات التطبيق', icon: Server },
    { id: 'architecture', nameEn: 'Architecture', nameAr: 'البنية المعمارية', icon: Layers },
    { id: 'challenge', nameEn: 'Master Challenge', nameAr: 'التحدي الشامل', icon: ShieldAlert },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto select-none sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? item.nameAr : item.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container Views */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'map' && (
          <AppSecWorldMap onSelectLab={(labId) => setActiveView(labId)} />
        )}

        {activeView === 'http_lifecycle' && (
          <HttpLifecycleLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToSessions={() => setActiveView('sessions')}
          />
        )}

        {activeView === 'sessions' && (
          <SessionSecurityLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToAuthz={() => setActiveView('access_control')}
          />
        )}

        {activeView === 'access_control' && (
          <AccessControlLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToValidation={() => setActiveView('validation')}
          />
        )}

        {activeView === 'validation' && (
          <InputValidationLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToSqli={() => setActiveView('sqli')}
          />
        )}

        {activeView === 'sqli' && (
          <SqlInjectionConceptLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToXss={() => setActiveView('xss')}
          />
        )}

        {activeView === 'xss' && (
          <XssConceptLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToCsrf={() => setActiveView('csrf')}
          />
        )}

        {activeView === 'csrf' && (
          <CsrfLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToApi={() => setActiveView('api_security')}
          />
        )}

        {activeView === 'api_security' && (
          <ApiSecurityLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToJwt={() => setActiveView('jwt')}
          />
        )}

        {activeView === 'jwt' && (
          <JwtSecurityLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToCors={() => setActiveView('cors')}
          />
        )}

        {activeView === 'cors' && (
          <CorsLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToFileUpload={() => setActiveView('file_upload')}
          />
        )}

        {activeView === 'file_upload' && (
          <FileUploadSecurityLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToHeaders={() => setActiveView('headers')}
          />
        )}

        {activeView === 'headers' && (
          <SecurityHeadersLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToRateLimiting={() => setActiveView('rate_limiting')}
          />
        )}

        {activeView === 'rate_limiting' && (
          <RateLimitingLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToLogging={() => setActiveView('app_logging')}
          />
        )}

        {activeView === 'app_logging' && (
          <AppLoggingLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToArchitecture={() => setActiveView('architecture')}
          />
        )}

        {activeView === 'architecture' && (
          <SecureArchitectureLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToChallenge={() => setActiveView('challenge')}
          />
        )}

        {activeView === 'challenge' && (
          <AppSecMasterChallenge
            onBackToMap={() => setActiveView('map')}
            onNavigateToLab={(labId) => setActiveView(labId)}
          />
        )}
      </div>
    </div>
  );
};
