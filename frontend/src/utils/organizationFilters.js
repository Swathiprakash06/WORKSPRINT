/**
 * Organizations allowed when provisioning an HR Admin (Create HR Admin screen).
 * Excludes suspended orgs and obvious test/dummy company names.
 */
export function isOrganizationEligibleForHRAdmin(org) {
  if (!org || org.id == null) return false;
  if (org.status === 'suspended') return false;

  const raw = (org.companyName || '').trim();
  if (!raw) return false;

  const name = raw.toLowerCase();
  const blockedExact = new Set([
    'test company',
    'dummy company',
    'sample company',
    'demo company',
    'test',
    'dummy',
    'sample',
  ]);
  if (blockedExact.has(name)) return false;
  if (name.includes('test company')) return false;

  if (/^(test|dummy|sample|demo)\b/i.test(raw)) return false;

  return true;
}
