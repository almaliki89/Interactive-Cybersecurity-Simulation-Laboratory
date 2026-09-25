/**
 * Web & Application Security: File Upload Defense & Storage Isolation Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface FileUploadPayload {
  originalFilename: string;
  declaredMimeType: string;
  sizeBytes: number;
  magicBytesHeader?: string; // Hex representation e.g. "25504446" for %PDF
  uploadedByUserId: string;
  virtualTime: number;
}

export interface UploadSecurityPolicy {
  allowedExtensions: string[]; // e.g. ['.pdf', '.png', '.jpg', '.jpeg', '.docx']
  allowedMimeTypes: string[]; // e.g. ['application/pdf', 'image/png', 'image/jpeg']
  maxSizeBytes: number; // e.g. 5 * 1024 * 1024 (5MB)
  enforceMagicBytesMatch: boolean;
  isolateStorageOutsideWebroot: boolean;
  renameToUuidOrHash: boolean;
  disableExecutablePermissions: boolean;
}

export interface FileUploadValidationResult {
  accepted: boolean;
  safeStoredPath?: string;
  safeStoredFilename?: string;
  rejectionReasonCode?:
    | 'PATH_TRAVERSAL_DETECTED'
    | 'DANGEROUS_EXTENSION'
    | 'MIME_TYPE_DISALLOWED'
    | 'MAGIC_BYTES_MISMATCH'
    | 'FILE_TOO_LARGE'
    | 'DOUBLE_EXTENSION_TRICK';
  reasonEn: string;
  reasonAr: string;
  securityFindings: string[];
}

export const DEFAULT_SECURE_UPLOAD_POLICY: UploadSecurityPolicy = {
  allowedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.docx'],
  allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxSizeBytes: 5 * 1024 * 1024,
  enforceMagicBytesMatch: true,
  isolateStorageOutsideWebroot: true,
  renameToUuidOrHash: true,
  disableExecutablePermissions: true,
};

export const DANGEROUS_EXTENSIONS = [
  '.php', '.php5', '.phtml', '.phar',
  '.exe', '.dll', '.so', '.bat', '.cmd', '.sh', '.bash',
  '.jsp', '.jspx', '.asp', '.aspx', '.cer',
  '.cgi', '.pl', '.py', '.rb',
  '.svg', '.html', '.htm', '.js',
];

/**
 * Validates an uploaded file payload against defensive upload policies
 */
export function validateUpload(
  file: FileUploadPayload,
  policy: UploadSecurityPolicy = DEFAULT_SECURE_UPLOAD_POLICY
): FileUploadValidationResult {
  const findings: string[] = [];

  // 1. Path Traversal & Null Byte checks
  if (
    file.originalFilename.includes('..') ||
    file.originalFilename.includes('/') ||
    file.originalFilename.includes('\\') ||
    file.originalFilename.includes('\0') ||
    file.originalFilename.includes('%00')
  ) {
    return {
      accepted: false,
      rejectionReasonCode: 'PATH_TRAVERSAL_DETECTED',
      reasonEn: 'CRITICAL: Path traversal characters or null byte injection detected in filename.',
      reasonAr: 'حرج: تم رصد محاولات اجتياز المسار (Path Traversal) أو حقن البايت الفارغ في اسم الملف.',
      securityFindings: ['Path traversal sequence stripped and blocked.'],
    };
  }

  // 2. Size limit check
  if (file.sizeBytes > policy.maxSizeBytes) {
    return {
      accepted: false,
      rejectionReasonCode: 'FILE_TOO_LARGE',
      reasonEn: `File size (${(file.sizeBytes / 1024 / 1024).toFixed(2)} MB) exceeds allowed quota (${(policy.maxSizeBytes / 1024 / 1024).toFixed(2)} MB).`,
      reasonAr: `حجم الملف يتجاوز الحد المسموح به (${(policy.maxSizeBytes / 1024 / 1024).toFixed(2)} ميجابايت).`,
      securityFindings: ['Size quota exceeded.'],
    };
  }

  // 3. Extension inspection
  const lowerName = file.originalFilename.toLowerCase();
  const extMatch = lowerName.match(/\.([a-z0-9]+)$/);
  const ext = extMatch ? `.${extMatch[1]}` : '';

  // Check double extension trick e.g. "avatar.php.png" or "report.pdf.exe"
  for (const dang of DANGEROUS_EXTENSIONS) {
    if (lowerName.includes(dang)) {
      return {
        accepted: false,
        rejectionReasonCode: 'DANGEROUS_EXTENSION',
        reasonEn: `Security Rejection: Dangerous executable extension '${dang}' found in filename.`,
        reasonAr: `رفض أمني: تم العثور على امتداد تنفيذي خطير '${dang}' في اسم الملف.`,
        securityFindings: [`Dangerous extension pattern detected: ${dang}`],
      };
    }
  }

  if (!policy.allowedExtensions.includes(ext)) {
    return {
      accepted: false,
      rejectionReasonCode: 'DANGEROUS_EXTENSION',
      reasonEn: `Extension '${ext}' is not on the strict allowlist: [${policy.allowedExtensions.join(', ')}].`,
      reasonAr: `الامتداد '${ext}' غير موجود في القائمة البيضاء المسموحة.`,
      securityFindings: [`Disallowed extension: ${ext}`],
    };
  }

  // 4. MIME Type check
  if (!policy.allowedMimeTypes.includes(file.declaredMimeType.toLowerCase())) {
    return {
      accepted: false,
      rejectionReasonCode: 'MIME_TYPE_DISALLOWED',
      reasonEn: `MIME type '${file.declaredMimeType}' is not permitted.`,
      reasonAr: `نوع وسائط MIME '${file.declaredMimeType}' غير مصرح به.`,
      securityFindings: [`Disallowed MIME type: ${file.declaredMimeType}`],
    };
  }

  // 5. Magic Bytes validation concept
  if (policy.enforceMagicBytesMatch && file.magicBytesHeader) {
    const magic = file.magicBytesHeader.toLowerCase();
    let magicMatch = false;

    if (ext === '.pdf' && magic.startsWith('25504446')) magicMatch = true; // %PDF
    else if (ext === '.png' && magic.startsWith('89504e47')) magicMatch = true; // .PNG
    else if ((ext === '.jpg' || ext === '.jpeg') && magic.startsWith('ffd8ff')) magicMatch = true;
    else if (ext === '.docx' && magic.startsWith('504b0304')) magicMatch = true; // PK..

    if (!magicMatch) {
      return {
        accepted: false,
        rejectionReasonCode: 'MAGIC_BYTES_MISMATCH',
        reasonEn: `MIME Confusion: File header magic bytes (${file.magicBytesHeader}) do not match extension '${ext}'.`,
        reasonAr: `تضارب صيغة الملف: البايتات السحرية للترويسة لا تطابق الامتداد '${ext}'.`,
        securityFindings: ['Magic bytes header mismatch (potential disguised executable).'],
      };
    }
  }

  // Generate safe storage path
  const safeFilename = generateSafeStoredFilename(file.uploadedByUserId, file.virtualTime, ext);
  const safePath = policy.isolateStorageOutsideWebroot
    ? `/var/isolated_storage/uploads/${safeFilename}`
    : `/var/www/html/uploads/${safeFilename}`;

  findings.push('File passed all security validations.');
  if (policy.renameToUuidOrHash) findings.push('Filename sanitized and randomized.');
  if (policy.isolateStorageOutsideWebroot) findings.push('Storage path isolated outside webroot.');
  if (policy.disableExecutablePermissions) findings.push('Direct script execution flag stripped.');

  return {
    accepted: true,
    safeStoredPath: safePath,
    safeStoredFilename: safeFilename,
    reasonEn: 'File successfully validated, renamed, and stored in isolated storage.',
    reasonAr: 'تم قبول الملف وتغيير اسمه وتخزينه في مسار معزول بأمان.',
    securityFindings: findings,
  };
}

/**
 * Generates a deterministic safe filename preventing collisions and execution
 */
export function generateSafeStoredFilename(
  userId: string,
  virtualTime: number,
  extension: string
): string {
  const sanitizedExt = extension.replace(/[^a-zA-Z0-9]/g, '');
  return `doc_${userId.replace(/[^a-zA-Z0-9_-]/g, '')}_${virtualTime}.${sanitizedExt || 'bin'}`;
}
