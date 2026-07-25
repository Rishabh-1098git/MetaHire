const COMMON_SKILLS = [
  "javascript",
  "typescript",
  "react",
  "node.js",
  "node",
  "python",
  "java",
  "c++",
  "c#",
  "go",
  "ruby",
  "sql",
  "mongodb",
  "redis",
  "graphql",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "html",
  "css",
  "tensorflow",
  "pytorch",
  "flutter",
  "swift",
  "objective-c",
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractTopSkills(text) {
  if (!text) return [];
  const lc = text.toLowerCase();
  const found = new Set();

  for (const skill of COMMON_SKILLS) {
    // create a flexible regex: allow dots and hyphens in skill tokens, and escape regex metacharacters
    const escaped = escapeRegExp(skill);
    const token = escaped.replace(/[-.]/g, "[\\s\\-\\.]?");
    const re = new RegExp(`\\b${token}\\b`, "i");
    if (re.test(lc)) found.add(skill.replace(/[.\-]/g, match => match === '.' ? '.' : '-'));
  }

  return Array.from(found).map((s) => {
    // cleanup display: common casing
    if (s === 'node') return 'Node.js';
    if (s === 'javascript') return 'JavaScript';
    if (s === 'typescript') return 'TypeScript';
    if (s === 'python') return 'Python';
    if (s === 'java') return 'Java';
    if (s === 'sql') return 'SQL';
    if (s === 'mongodb') return 'MongoDB';
    if (s === 'graphql') return 'GraphQL';
    if (s === 'docker') return 'Docker';
    if (s === 'kubernetes') return 'Kubernetes';
    if (s === 'aws') return 'AWS';
    if (s === 'gcp') return 'GCP';
    if (s === 'azure') return 'Azure';
    if (s === 'html') return 'HTML';
    if (s === 'css') return 'CSS';
    return s.charAt(0).toUpperCase() + s.slice(1);
  });
}

export default extractTopSkills;
