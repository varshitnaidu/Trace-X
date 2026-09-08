export interface DemoCase {
  id: string;
  date: string;
  subject: string;
  sender: string;
  senderName: string;
  returnPath: string;
  replyTo: string;
  classification: 'PHISHING' | 'BEC' | 'IMPERSONATION' | 'MALWARE' | 'BENIGN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  status: 'NEW' | 'INVESTIGATING' | 'CONFIRMED' | 'MITIGATED' | 'CLOSED';
  analyst: string;
  campaignId?: string;
  campaignName?: string;
  sha256: string;
  fileSize: string;
  spf: { status: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE'; detail: string };
  dkim: { status: 'PASS' | 'FAIL' | 'NONE'; detail: string };
  dmarc: { status: 'PASS' | 'FAIL' | 'NONE'; detail: string; policy: string };
  relays: Array<{
    hop: number;
    ip: string;
    hostname: string;
    country: string;
    city: string;
    asn: string;
    provider: string;
    delay: string;
    timestamp: string;
    confidence: number;
    isSuspicious: boolean;
  }>;
  urls: Array<{
    url: string;
    domain: string;
    reputation: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN';
    indicators: string[];
    riskScore: number;
  }>;
  domains: Array<{
    domain: string;
    age: string;
    registrar: string;
    mxRecord: string;
    isLookalike: boolean;
    reputation: string;
  }>;
  ips: Array<{
    ip: string;
    type: 'PUBLIC' | 'PRIVATE';
    location: string;
    asn: string;
    provider: string;
    abuseScore: number;
    flag: string;
  }>;
  contributingFactors: Array<{
    factor: string;
    weight: number;
    type: 'critical' | 'high' | 'medium' | 'low';
  }>;
  aiExplanation: {
    summary: string;
    keyFindings: string[];
    investigationSteps: string[];
    attributionDisclaimer: string;
  };
}

export const DEMO_CASES: DemoCase[] = [
  {
    id: 'CAS-2026-0091',
    date: '2026-09-07 11:24 UTC',
    subject: 'URGENT: Executive Wire Transfer Confirmation - Invoice #88491',
    sender: 'ceo-office@paypaI-billing-service.net',
    senderName: 'Satya Nadella [CEO Executive Office]',
    returnPath: 'bounce-gateway@relay-server-91.ru',
    replyTo: 'financial-exec-settlement@proton.me',
    classification: 'BEC',
    severity: 'CRITICAL',
    riskScore: 94,
    status: 'INVESTIGATING',
    analyst: 'Sarah Jenkins (Senior SOC Lead)',
    campaignId: 'CMP-FIN-2026-04',
    campaignName: 'ShadowWire Executive Impersonation',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    fileSize: '42.8 KB',
    spf: {
      status: 'FAIL',
      detail: 'IP 185.220.101.42 is not authorized under domain spf records.'
    },
    dkim: {
      status: 'FAIL',
      detail: 'Signature failed body hash verification (rsa-sha256 key mismatch).'
    },
    dmarc: {
      status: 'FAIL',
      detail: 'Domain alignment failed. From domain does not match SPF/DKIM envelope.',
      policy: 'reject'
    },
    relays: [
      {
        hop: 1,
        ip: '185.220.101.42',
        hostname: 'tor-exit-relay-nl.nodehost.net',
        country: 'Netherlands',
        city: 'Amsterdam',
        asn: 'AS60729',
        provider: 'Zwiebelfreunde E.V.',
        delay: '0.4s',
        timestamp: '11:23:41 UTC',
        confidence: 88,
        isSuspicious: true
      },
      {
        hop: 2,
        ip: '194.26.29.110',
        hostname: 'vps-bulletproof-mow.ru',
        country: 'Russia',
        city: 'Moscow',
        asn: 'AS44050',
        provider: 'Petersburg Internet Network',
        delay: '1.2s',
        timestamp: '11:23:43 UTC',
        confidence: 94,
        isSuspicious: true
      },
      {
        hop: 3,
        ip: '142.250.190.27',
        hostname: 'mail-ed1-f27.google.com',
        country: 'United States',
        city: 'Mountain View',
        asn: 'AS15169',
        provider: 'Google LLC',
        delay: '0.8s',
        timestamp: '11:24:01 UTC',
        confidence: 99,
        isSuspicious: false
      }
    ],
    urls: [
      {
        url: 'https://paypaI-billing-service.net/portal/invoice/auth-wire-confirm.php',
        domain: 'paypaI-billing-service.net',
        reputation: 'MALICIOUS',
        indicators: ['Homoglyph (Latin I for l)', 'Credential Harvester Path', 'Known PhishTank IOC'],
        riskScore: 96
      },
      {
        url: 'http://185.220.101.42/payload/invoice-doc-88491.exe.pdf',
        domain: '185.220.101.42',
        reputation: 'MALICIOUS',
        indicators: ['Raw IP URL', 'Double extension executable disguise', 'AbuseIPDB 100% confidence'],
        riskScore: 99
      }
    ],
    domains: [
      {
        domain: 'paypaI-billing-service.net',
        age: '3 days old (Registered 2026-09-04)',
        registrar: 'NameCheap Inc.',
        mxRecord: 'mail.paypaI-billing-service.net',
        isLookalike: true,
        reputation: 'Malicious / Typosquatting'
      }
    ],
    ips: [
      {
        ip: '185.220.101.42',
        type: 'PUBLIC',
        location: 'Amsterdam, Netherlands',
        asn: 'AS60729',
        provider: 'Zwiebelfreunde E.V. (Tor Exit Node)',
        abuseScore: 94,
        flag: 'NL'
      },
      {
        ip: '194.26.29.110',
        type: 'PUBLIC',
        location: 'Moscow, Russia',
        asn: 'AS44050',
        provider: 'Petersburg Internet Network',
        abuseScore: 89,
        flag: 'RU'
      }
    ],
    contributingFactors: [
      { factor: 'DMARC alignment failure & spoofed envelope', weight: 20, type: 'critical' },
      { factor: 'Sender Display Name impersonating Executive C-Level', weight: 15, type: 'critical' },
      { factor: 'Known Tor Exit Relay in upstream SMTP Received hop', weight: 15, type: 'high' },
      { factor: 'Homoglyph lookalike domain (paypaI using uppercase I)', weight: 15, type: 'critical' },
      { factor: 'NLP BEC indicators: urgent bank wire request & secret settlement', weight: 14, type: 'high' },
      { factor: 'External bulletproof hosting relay with 89% Abuse confidence', weight: 10, type: 'high' },
      { factor: 'Reply-To points to disposable ProtonMail address', weight: 5, type: 'medium' }
    ],
    aiExplanation: {
      summary: 'High-confidence Business Email Compromise (BEC) and brand spoofing attack. The adversary leverages a homoglyphic typosquatted domain (paypaI-billing-service.net) to impersonate executive leadership and request emergency international wire disbursement.',
      keyFindings: [
        'Domain homoglyph disguises "paypal" by replacing the lowercase "l" with capital "I".',
        'Authentication tri-factor failed completely: SPF (Fail), DKIM (Fail), and DMARC (Reject policy breached).',
        'Direct SMTP insertion originated from an anonymous Tor exit relay (185.220.101.42), routed through bulletproof Russian infrastructure.',
        'Urgent financial settlement language matches known ShadowWire cyber-syndicate templates.'
      ],
      investigationSteps: [
        'Place immediate block on domain `paypaI-billing-service.net` at corporate perimeter email gateways.',
        'Null-route traffic to IPs 185.220.101.42 and 194.26.29.110 on firewall border routers.',
        'Confirm with finance department that no funds were remitted under invoice #88491.',
        'Preserve EML artifact and export forensic dossier for regulatory submission.'
      ],
      attributionDisclaimer: 'Observed IP and ASN infrastructure represent intermediate routing nodes and bulletproof hosting proxies. Technical evidence does not assert physical or legal human attribution.'
    }
  },
  {
    id: 'CAS-2026-0087',
    date: '2026-09-06 18:10 UTC',
    subject: 'Action Required: Microsoft 365 Password Expiry Warning',
    sender: 'no-reply@security-microsoft-update365.com',
    senderName: 'Microsoft Security Team',
    returnPath: 'mailer@security-microsoft-update365.com',
    replyTo: 'support@security-microsoft-update365.com',
    classification: 'PHISHING',
    severity: 'HIGH',
    riskScore: 78,
    status: 'CONFIRMED',
    analyst: 'Devon Vance',
    campaignId: 'CMP-M365-2026-11',
    campaignName: 'OfficeHarvester Global Campaign',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    fileSize: '31.2 KB',
    spf: { status: 'SOFTFAIL', detail: 'Domain records softfail for sending server.' },
    dkim: { status: 'NONE', detail: 'No DKIM signature found in header.' },
    dmarc: { status: 'FAIL', detail: 'DMARC alignment failed (p=none).' , policy: 'none'},
    relays: [
      {
        hop: 1,
        ip: '45.154.255.88',
        hostname: 'vps45154.hostwinds.com',
        country: 'Germany',
        city: 'Frankfurt',
        asn: 'AS54290',
        provider: 'Hostwinds LLC',
        delay: '1.1s',
        timestamp: '18:09:44 UTC',
        confidence: 85,
        isSuspicious: true
      }
    ],
    urls: [
      {
        url: 'https://security-microsoft-update365.com/login.aspx?auth=token991',
        domain: 'security-microsoft-update365.com',
        reputation: 'MALICIOUS',
        indicators: ['Credential Phishing Form', 'Typosquatted Brand'],
        riskScore: 88
      }
    ],
    domains: [
      {
        domain: 'security-microsoft-update365.com',
        age: '12 days old',
        registrar: 'Tucows Domains Inc.',
        mxRecord: 'mail.security-microsoft-update365.com',
        isLookalike: true,
        reputation: 'Malicious'
      }
    ],
    ips: [
      {
        ip: '45.154.255.88',
        type: 'PUBLIC',
        location: 'Frankfurt, Germany',
        asn: 'AS54290',
        provider: 'Hostwinds LLC',
        abuseScore: 74,
        flag: 'DE'
      }
    ],
    contributingFactors: [
      { factor: 'Brand impersonation: Microsoft 365 security notification', weight: 25, type: 'critical' },
      { factor: 'Phishing login credential URL targeting corporate SSO', weight: 25, type: 'critical' },
      { factor: 'Newly registered domain (< 15 days old)', weight: 15, type: 'high' },
      { factor: 'DKIM signature absent & SPF Softfail', weight: 13, type: 'medium' }
    ],
    aiExplanation: {
      summary: 'Credential harvesting phishing email designed to emulate corporate Microsoft 365 SSO portal notifications.',
      keyFindings: [
        'Domain `security-microsoft-update365.com` is an unauthorized third-party lookalike.',
        'Target URL leads directly to a reverse-proxy credential capture page (Evilginx-style).',
        'Sender is not associated with legitimate Microsoft IP ranges.'
      ],
      investigationSteps: [
        'Revoke active session tokens for any users who clicked the destination URL.',
        'Add domain to web gateway DNS blocklist.',
        'Reset user Active Directory password.'
      ],
      attributionDisclaimer: 'Observed hosting provider: Hostwinds Frankfurt VPS. Attribution relates solely to external infrastructure.'
    }
  },
  {
    id: 'CAS-2026-0072',
    date: '2026-09-05 09:15 UTC',
    subject: 'Monthly All-Hands Meeting Agenda & Slide Deck',
    sender: 'internal-comms@company.org',
    senderName: 'Internal Communications Team',
    returnPath: 'internal-comms@company.org',
    replyTo: 'internal-comms@company.org',
    classification: 'BENIGN',
    severity: 'LOW',
    riskScore: 12,
    status: 'CLOSED',
    analyst: 'System Automated Triage',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    fileSize: '18.4 KB',
    spf: { status: 'PASS', detail: 'Sender IP is in authorized SPF CIDR block.' },
    dkim: { status: 'PASS', detail: 'Signature verified with selector k1.' },
    dmarc: { status: 'PASS', detail: 'Full alignment verified with p=reject policy.', policy: 'reject' },
    relays: [
      {
        hop: 1,
        ip: '209.85.220.41',
        hostname: 'mail-sor-f41.google.com',
        country: 'United States',
        city: 'Council Bluffs',
        asn: 'AS15169',
        provider: 'Google LLC',
        delay: '0.3s',
        timestamp: '09:14:55 UTC',
        confidence: 99,
        isSuspicious: false
      }
    ],
    urls: [
      {
        url: 'https://intranet.company.org/all-hands/2026-09',
        domain: 'intranet.company.org',
        reputation: 'CLEAN',
        indicators: ['Internal Corporate Domain', 'Valid SSL/TLS'],
        riskScore: 0
      }
    ],
    domains: [
      {
        domain: 'company.org',
        age: '8 years old',
        registrar: 'MarkMonitor Inc.',
        mxRecord: 'aspmx.l.google.com',
        isLookalike: false,
        reputation: 'Reputable / Internal'
      }
    ],
    ips: [
      {
        ip: '209.85.220.41',
        type: 'PUBLIC',
        location: 'Council Bluffs, US',
        asn: 'AS15169',
        provider: 'Google LLC',
        abuseScore: 0,
        flag: 'US'
      }
    ],
    contributingFactors: [
      { factor: 'All authentication checks passed cleanly (SPF, DKIM, DMARC)', weight: 0, type: 'low' },
      { factor: 'No suspicious linguistic or financial keywords detected', weight: 0, type: 'low' }
    ],
    aiExplanation: {
      summary: 'Legitimate internal corporate communication with authenticated routing and trusted domain history.',
      keyFindings: [
        'MIME headers show flawless SPF, DKIM, and DMARC alignment.',
        'Links point exclusively to approved internal corporate web properties.',
        'No malicious indicators detected across all threat intel sources.'
      ],
      investigationSteps: [
        'No analyst action required. Case automatically closed as benign.'
      ],
      attributionDisclaimer: 'Standard enterprise Google Workspace infrastructure.'
    }
  }
];

export const DEMO_CAMPAIGNS = [
  {
    id: 'CMP-FIN-2026-04',
    name: 'ShadowWire Executive Impersonation',
    threatActorGroup: 'UNC-2911 (Tracked Cluster)',
    firstSeen: '2026-08-14',
    lastSeen: '2026-09-07',
    severity: 'CRITICAL',
    confidenceScore: 92,
    associatedEmailsCount: 14,
    sharedDomains: ['paypaI-billing-service.net', 'wire-exec-auth.cc', 'swift-settlement-corp.com'],
    sharedIPs: ['185.220.101.42', '194.26.29.110', '91.240.118.50'],
    targetedSectors: ['Financial Services', 'Higher Education', 'Defense Contractors'],
    summary: 'Active spear-phishing and executive wire fraud campaign leveraging homoglyph domain impersonation, Tor exit relay routing, and bulletproof Russian VPS hosts.'
  },
  {
    id: 'CMP-M365-2026-11',
    name: 'OfficeHarvester Global Campaign',
    threatActorGroup: 'Storm-0824 (Likely)',
    firstSeen: '2026-07-28',
    lastSeen: '2026-09-06',
    severity: 'HIGH',
    confidenceScore: 84,
    associatedEmailsCount: 38,
    sharedDomains: ['security-microsoft-update365.com', 'login-office365-verify.info', 'm365-session-auth.net'],
    sharedIPs: ['45.154.255.88', '193.106.191.24', '185.162.228.17'],
    targetedSectors: ['Technology', 'Healthcare', 'Government Administration'],
    summary: 'Widespread automated credential harvesting campaign sending fake 2FA and password expiry notices leading to adversary-in-the-middle (AiTM) landing portals.'
  }
];

export const DEMO_AUDIT_LOGS = [
  {
    id: 'AUD-8801',
    timestamp: '2026-09-07 11:25:03 UTC',
    analyst: 'sarah.jenkins@trace-x.soc',
    action: 'EMAIL_ANALYSIS_EXECUTED',
    resource: 'CAS-2026-0091 / e3b0c442...b855',
    status: 'SUCCESS',
    hash: '8f92a10bce32b0f491c10fae12089401abef8214b2d18471b069d300e8f23c91',
    previousHash: '5e44a19bce32b0f491c10fae12089401abef8214b2d18471b069d300e8f23c02'
  },
  {
    id: 'AUD-8802',
    timestamp: '2026-09-07 11:27:14 UTC',
    analyst: 'sarah.jenkins@trace-x.soc',
    action: 'CASE_ESCALATION_CRITICAL',
    resource: 'CAS-2026-0091 (ShadowWire Campaign)',
    status: 'SUCCESS',
    hash: 'a109fe829c3214da881b90cdfe712490acbe82410a920418cdae7829104cde91',
    previousHash: '8f92a10bce32b0f491c10fae12089401abef8214b2d18471b069d300e8f23c91'
  },
  {
    id: 'AUD-8803',
    timestamp: '2026-09-07 11:32:40 UTC',
    analyst: 'sarah.jenkins@trace-x.soc',
    action: 'FORENSIC_REPORT_GENERATED',
    resource: 'REP-CAS-2026-0091.pdf',
    status: 'SUCCESS',
    hash: 'b49208afdae812498badef1289402941acbfa829410948acde8291048bace820',
    previousHash: 'a109fe829c3214da881b90cdfe712490acbe82410a920418cdae7829104cde91'
  },
  {
    id: 'AUD-8804',
    timestamp: '2026-09-07 11:35:10 UTC',
    analyst: 'system-sentinel',
    action: 'CHAIN_INTEGRITY_VERIFICATION',
    resource: 'LEDGER_BLOCK_0091',
    status: 'CHAIN VERIFIED',
    hash: 'c819208194bade012948210948baefca90294812048bacde01948baef0129481',
    previousHash: 'b49208afdae812498badef1289402941acbfa829410948acde8291048bace820'
  }
];

export const DEMO_RAW_EML = `From: "Satya Nadella [CEO Executive Office]" <ceo-office@paypaI-billing-service.net>
To: "Chief Financial Officer" <cfo@enterprise-corp.com>
Subject: URGENT: Executive Wire Transfer Confirmation - Invoice #88491
Date: Mon, 7 Sep 2026 11:23:40 +0000
Message-ID: <20260907112340.88491.exec@paypaI-billing-service.net>
Reply-To: financial-exec-settlement@proton.me
Return-Path: <bounce-gateway@relay-server-91.ru>
Received: from mail-ed1-f27.google.com (mail-ed1-f27.google.com [142.250.190.27])
    by mx.enterprise-corp.com with ESMTPS id j8si9928131
    for <cfo@enterprise-corp.com>; Mon, 07 Sep 2026 11:24:01 +0000
Received: from vps-bulletproof-mow.ru (vps-bulletproof-mow.ru [194.26.29.110])
    by mail-ed1-f27.google.com with ESMTP id q4so891283
    for <cfo@enterprise-corp.com>; Mon, 07 Sep 2026 11:23:43 +0000
Received: from tor-exit-relay-nl.nodehost.net (tor-exit-relay-nl.nodehost.net [185.220.101.42])
    by vps-bulletproof-mow.ru with SMTP id 994812; Mon, 07 Sep 2026 11:23:41 +0000
Authentication-Results: mx.enterprise-corp.com;
    spf=fail (sender IP is 185.220.101.42) smtp.mailfrom=bounce-gateway@relay-server-91.ru;
    dkim=fail header.d=paypaI-billing-service.net header.b=X992a;
    dmarc=fail (p=reject sp=reject) header.from=paypaI-billing-service.net
Content-Type: text/html; charset="UTF-8"
MIME-Version: 1.0

<html>
<body>
<p>Dear Finance Team,</p>
<p>Please process the attached urgent international wire settlement of <b>$248,500.00 USD</b> for our confidential strategic cloud acquisition (Invoice #88491).</p>
<p>Due to strict non-disclosure obligations, do not discuss this over open internal channels. Complete the verification through our secured portal link below:</p>
<p><a href="https://paypaI-billing-service.net/portal/invoice/auth-wire-confirm.php">Verify Wire Authorization & Download Signed Invoice Doc</a></p>
<p>Direct download backup: <a href="http://185.220.101.42/payload/invoice-doc-88491.exe.pdf">http://185.220.101.42/payload/invoice-doc-88491.exe.pdf</a></p>
<br>
<p>Regards,<br>
<b>Satya Nadella</b><br>
Chief Executive Officer</p>
</body>
</html>`;
