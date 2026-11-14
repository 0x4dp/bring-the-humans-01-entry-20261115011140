const fs = require('fs');
const path = require('path');

const envPath = 'C:/Users/fourdepe/.bring-the-humans/.env';
const env = fs.readFileSync(envPath, 'utf-8');
const token = env.split('\n').find(l => l.startsWith('GITHUB_TOKEN=')).split('=', 2)[1].trim();

const projectDir = 'C:/Users/fourdepe/bring-the-humans-01';
const repoName = 'bring-the-humans-01';
const owner = '0x4dp';
const base = 'https://api.github.com';

async function gh(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'nova-agent',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GitHub API ${method} ${url} failed: ${res.status} ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function main() {
  console.log('ðŸ“¦ Membuat repo GitHub...');
  let repo;
  try {
    repo = await gh('POST', `${base}/user/repos`, {
      name: repoName,
      description: 'Bring the humans â€” landing page referral untuk make.fun bounty bring-the-humans-01',
      private: false,
      auto_init: false
    });
    console.log('   Repo dibuat:', repo.html_url);
  } catch (e) {
    if (e.message.includes('422') && e.message.includes('already exists')) {
      repo = await gh('GET', `${base}/repos/${owner}/${repoName}`);
      console.log('   Repo sudah ada:', repo.html_url);
    } else {
      throw e;
    }
  }

  const files = ['index.html', 'LICENSE', 'README.md'];
  let lastCommitSha = null;

  for (const file of files) {
    const filePath = path.join(projectDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const base64 = Buffer.from(content).toString('base64');

    console.log(`   â¬†ï¸  Upload ${file}...`);
    const result = await gh('PUT', `${base}/repos/${owner}/${repoName}/contents/${file}`, {
      message: `Add ${file} for bring-the-humans-01 entry`,
      content: base64,
      branch: 'main'
    });
    lastCommitSha = result.commit.sha;
    console.log(`   âœ… ${file} di-commit: ${result.commit.sha}`);
  }

  console.log('\nðŸŽ‰ Selesai!');
  console.log(`   Repo: ${repo.html_url}`);
  console.log(`   Commit SHA: ${lastCommitSha}`);
}

main().catch(e => { console.error('âŒ Error:', e.message); process.exit(1); });
