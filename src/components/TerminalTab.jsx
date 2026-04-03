import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

// ── Session start time (for uptime command) ────────────────────────────────────
const TERMINAL_START_TIME = Date.now();

// ── ANSI helpers ───────────────────────────────────────────────────────────────
const RESET   = '\x1b[0m';
const BOLD    = '\x1b[1m';
const DIM     = '\x1b[2m';
const GREEN   = '\x1b[32m';
const CYAN    = '\x1b[36m';
const YELLOW  = '\x1b[33m';
const RED     = '\x1b[31m';
const BLUE    = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const WHITE   = '\x1b[37m';
const BG_RED  = '\x1b[41m';

// ── Virtual filesystem helpers ─────────────────────────────────────────────────
function buildVirtualFS() {
  let themeHTML = '';
  try { themeHTML = localStorage.getItem('webeditr_project') || ''; } catch { /* ignore */ }

  const styleMatch = themeHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const extractedCSS = styleMatch ? styleMatch[1].trim() : '/* No <style> block found in theme */';

  const titleMatch = themeHTML.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].trim() : 'Untitled';

  return {
    '/': { type: 'dir', children: ['project', 'templates', 'README.md'] },

    '/project': { type: 'dir', children: ['index.html', 'styles.css', 'assets'] },
    '/project/index.html': {
      type: 'file',
      get content() {
        const iframe = document.querySelector('iframe[title="Theme Canvas"]');
        if (iframe?.contentDocument) {
          const html = iframe.contentDocument.documentElement.outerHTML;
          if (html && html.length > 50) return html;
        }
        try {
          const saved = localStorage.getItem('webeditr_project');
          if (saved) return saved;
        } catch { /* ignore */ }
        return '<!-- No theme loaded. Open a theme in the editor first. -->';
      },
    },
    '/project/styles.css': { type: 'file', content: extractedCSS },
    '/project/assets':     { type: 'dir', children: [] },

    '/templates': {
      type: 'dir',
      children: ['hero-section.html', 'navbar.html', 'footer.html', 'card.html', 'cta-banner.html'],
    },
    '/templates/hero-section.html': {
      type: 'file',
      content: '<section class="hero">\n  <h1>Hero Title</h1>\n  <p>Subtitle text goes here.</p>\n  <a href="#" class="btn-primary">Get Started</a>\n</section>',
    },
    '/templates/navbar.html': {
      type: 'file',
      content: '<nav class="navbar">\n  <a href="#" class="logo">Brand</a>\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>',
    },
    '/templates/footer.html': {
      type: 'file',
      content: '<footer class="footer">\n  <p>&copy; 2024 WebEdit-r. All rights reserved.</p>\n</footer>',
    },
    '/templates/card.html': {
      type: 'file',
      content: '<div class="card">\n  <img src="https://placehold.co/300x200" alt="Card image">\n  <div class="card-body">\n    <h3>Card Title</h3>\n    <p>Card description text.</p>\n    <a href="#">Read more</a>\n  </div>\n</div>',
    },
    '/templates/cta-banner.html': {
      type: 'file',
      content: '<div class="cta-banner">\n  <h2>Ready to get started?</h2>\n  <p>Join thousands of users today.</p>\n  <a href="#" class="btn-cta">Start Free Trial</a>\n</div>',
    },

    '/README.md': {
      type: 'file',
      content: [
        '# WebEdit-r Virtual Terminal',
        '',
        'Welcome! Browse and export your theme files from the browser.',
        '',
        '## Navigation',
        '  ls [path]   List directory contents',
        '  cd <path>   Change directory  (cd .., cd /project)',
        '  pwd         Print working directory',
        '  tree [path] Show recursive directory tree',
        '',
        '## File Operations',
        '  cat <file>  View file contents',
        '  export      Download theme as index.html',
        '',
        '## Debugging',
        '  logs        View captured error logs',
        '  logs:clear  Clear error log history',
        '  theme       Show current theme statistics',
        '',
        '## Utilities',
        '  history     Show command history',
        '  clear       Clear terminal screen',
        '  help        Show all commands',
        '',
        `Theme loaded: ${pageTitle}`,
      ].join('\n'),
    },
  };
}

function normalizePath(path) {
  const parts = path.split('/').filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (p === '..') out.pop();
    else if (p !== '.') out.push(p);
  }
  return '/' + out.join('/');
}

function resolvePath(cwd, target) {
  if (!target || target === '~' || target === '/') return '/';
  if (target.startsWith('/')) return normalizePath(target);
  return normalizePath(cwd === '/' ? '/' + target : cwd + '/' + target);
}

function displayPath(path) {
  return path === '/' ? '~' : '~' + path;
}

// ── Startup guide banner ───────────────────────────────────────────────────────
function writeStartupGuide(term) {
  const B = BOLD, R = RESET, D = DIM, G = GREEN, C = CYAN, Y = YELLOW, M = MAGENTA;
  const ln = (s = '') => term.writeln(s);

  ln(`${B}${C}╔═══════════════════════════════════════════════════════╗${R}`);
  ln(`${B}${C}║        WebEdit-r Terminal v2.0                        ║${R}`);
  ln(`${B}${C}║        Virtual File System  +  Error Logger           ║${R}`);
  ln(`${B}${C}╚═══════════════════════════════════════════════════════╝${R}`);
  ln();
  ln(`${B}${Y}  QUICK START GUIDE${R}`);
  ln(`${D}  ─────────────────────────────────────────────────────${R}`);
  ln();
  ln(`${B}  Navigation:${R}`);
  ln(`${G}    ls${R}              List files in directory`);
  ln(`${G}    cd ${C}<path>${R}       Change directory  ${D}(try: cd /templates)${R}`);
  ln(`${G}    pwd${R}             Show current path`);
  ln(`${G}    tree${R}            Show full directory tree`);
  ln();
  ln(`${B}  File Operations:${R}`);
  ln(`${G}    cat ${C}<file>${R}      View file contents  ${D}(try: cat README.md)${R}`);
  ln(`${G}    export${R}          Download current project as HTML`);
  ln();
  ln(`${B}  Debugging & Logs:${R}`);
  ln(`${G}    logs${R}            View captured error logs`);
  ln(`${G}    logs:clear${R}      Clear error log history`);
  ln(`${G}    theme${R}           Show current theme statistics`);
  ln();
  ln(`${B}  Utilities:${R}`);
  ln(`${G}    history${R}         Show command history`);
  ln(`${G}    clear${R}           Clear terminal screen`);
  ln(`${G}    help${R}            Show all commands`);
  ln();
  ln(`${B}${M}  Tips:${R}`);
  ln(`${M}   •${R} Press ${B}↑${R} / ${B}↓${R} to navigate command history`);
  ln(`${M}   •${R} Press ${B}Tab${R} for auto-complete`);
  ln(`${M}   •${R} Runtime errors are captured automatically — type ${B}${C}logs${R} to view`);
  ln(`${M}   •${R} Type ${B}${C}restart${R} (header button) to reload theme data`);
  ln();
  ln(`${D}  ─────────────────────────────────────────────────────${R}`);
  ln();
}

// ── Virtual command executor ───────────────────────────────────────────────────
function executeVirtualCommand(term, rawCmd, fs, cwdRef, histRef, errorLogsRef, onErrorCountChange) {
  const args = rawCmd.trim().split(/\s+/);
  const cmd  = args[0].toLowerCase();
  const arg1 = args[1];

  const println  = (line = '') => term.writeln(line);
  const printErr = (msg) => term.writeln(`${RED}Error: ${msg}${RESET}`);

  switch (cmd) {

    case 'help': {
      println();
      println(`${BOLD}${CYAN}╔═══════════════ WebEdit-r Terminal Commands ════════════╗${RESET}`);
      println();

      const sections = [
        ['Navigation', [
          ['ls [path]',   'List directory contents'],
          ['cd <path>',   'Change directory  (.. to go up, ~ for root)'],
          ['pwd',         'Print working directory'],
          ['tree [path]', 'Show recursive directory tree'],
        ]],
        ['File Operations', [
          ['cat <file>',  'Display file contents'],
          ['export',      'Download project as HTML file'],
        ]],
        ['Debugging & Logs', [
          ['logs',        'View all captured error logs'],
          ['logs:clear',  'Clear error log history'],
          ['theme',       'Show current theme statistics'],
        ]],
        ['AI Builder', [
          ['ai "<prompt>"',  'Queue an AI generation request'],
          ['ai site "<desc>"', 'Queue full-site generation'],
          ['ai code "<desc>"', 'Queue code snippet generation'],
        ]],
        ['Git', [
          ['git init',          'Initialize repository'],
          ['git status',        'Show working tree status'],
          ['git add <file>',    'Stage file (use . for all)'],
          ['git commit -m ""',  'Commit staged changes'],
          ['git log',           'Show commit history'],
          ['git branch [name]', 'List or create branch'],
          ['git checkout <b>',  'Switch branch'],
          ['git push/pull',     'Push or pull (simulated)'],
        ]],
        ['NPM', [
          ['npm init',           'Create package.json'],
          ['npm install <pkg>',  'Install package (simulated)'],
          ['npm uninstall <pkg>','Remove package'],
          ['npm list',           'Show installed packages'],
          ['npm run <script>',   'Run package script'],
        ]],
        ['Utilities', [
          ['whoami',    'Show current user'],
          ['date',      'Show current date/time'],
          ['uptime',    'Show terminal uptime'],
          ['ping <host>','Ping a host (simulated)'],
          ['wget <url>', 'Download URL (simulated)'],
          ['curl <url>', 'Fetch URL (simulated)'],
          ['history',   'Show command history'],
          ['clear',     'Clear terminal screen'],
          ['help',      'Show this help message'],
        ]],
      ];

      for (const [sectionName, cmds] of sections) {
        println(`${BOLD}  ${sectionName}:${RESET}`);
        for (const [name, desc] of cmds) {
          println(`  ${GREEN}${name.padEnd(16)}${RESET}${DIM}${desc}${RESET}`);
        }
        println();
      }

      println(`${BOLD}${MAGENTA}  Tips:${RESET}`);
      println(`${MAGENTA}   •${RESET} Errors are automatically captured — type ${BOLD}${CYAN}logs${RESET} to view`);
      println(`${MAGENTA}   •${RESET} Use ${BOLD}↑${RESET}/${BOLD}↓${RESET} arrows for history, ${BOLD}Tab${RESET} to auto-complete`);
      println();
      println(`${BOLD}${CYAN}╚════════════════════════════════════════════════════════╝${RESET}`);
      break;
    }

    case 'pwd': {
      println(displayPath(cwdRef.current));
      break;
    }

    case 'ls': {
      const targetPath = arg1 ? resolvePath(cwdRef.current, arg1) : cwdRef.current;
      const node = fs[targetPath];
      if (!node) { printErr(`No such directory: ${arg1 || targetPath}`); break; }
      if (node.type !== 'dir') { printErr(`Not a directory: ${arg1}`); break; }

      if (node.children.length === 0) {
        println(`${DIM}(empty directory)${RESET}`);
      } else {
        println();
        for (const child of node.children) {
          const childPath = targetPath === '/' ? '/' + child : targetPath + '/' + child;
          const childNode = fs[childPath];
          if (childNode?.type === 'dir') {
            term.write(`  ${BOLD}${BLUE}${child}/${RESET}  `);
          } else {
            const ext = child.split('.').pop();
            const color = ext === 'html' ? YELLOW : ext === 'css' ? CYAN : ext === 'md' ? GREEN : WHITE;
            term.write(`  ${color}${child}${RESET}  `);
          }
        }
        println();
      }
      break;
    }

    case 'cd': {
      if (!arg1 || arg1 === '~') { cwdRef.current = '/'; break; }
      const newPath = resolvePath(cwdRef.current, arg1);
      const node = fs[newPath];
      if (!node) { printErr(`No such directory: ${arg1}`); break; }
      if (node.type !== 'dir') { printErr(`Not a directory: ${arg1}`); break; }
      cwdRef.current = newPath;
      break;
    }

    case 'cat': {
      if (!arg1) { printErr('Usage: cat <file>'); break; }
      const filePath = resolvePath(cwdRef.current, arg1);
      const node = fs[filePath];
      if (!node) { printErr(`No such file: ${arg1}`); break; }
      if (node.type === 'dir') { printErr(`${arg1} is a directory`); break; }

      println(`${DIM}── ${filePath} ──────────────────────────────────${RESET}`);
      const lines = node.content.split('\n');
      const preview = lines.slice(0, 60);
      for (const line of preview) println(line.replace(/\x1b/g, ''));
      if (lines.length > 60) {
        println(`${DIM}… (${lines.length - 60} more lines — use export to get full file)${RESET}`);
      }
      break;
    }

    case 'tree': {
      const rootPath = arg1 ? resolvePath(cwdRef.current, arg1) : cwdRef.current;
      if (!fs[rootPath] || fs[rootPath].type !== 'dir') {
        printErr(`Not a directory: ${arg1 || rootPath}`);
        break;
      }
      println();
      println(`${BOLD}${displayPath(rootPath)}${RESET}`);

      function printTree(dirPath, prefix) {
        const node = fs[dirPath];
        if (!node || node.type !== 'dir') return;
        node.children.forEach((child, i) => {
          const isLast = i === node.children.length - 1;
          const childPath = dirPath === '/' ? '/' + child : dirPath + '/' + child;
          const childNode = fs[childPath];
          const isDir = childNode?.type === 'dir';
          const color = isDir ? `${BOLD}${BLUE}` : YELLOW;
          const suffix = isDir ? '/' : '';
          println(`${DIM}${prefix}${isLast ? '└── ' : '├── '}${RESET}${color}${child}${suffix}${RESET}`);
          if (isDir) printTree(childPath, prefix + (isLast ? '    ' : '│   '));
        });
      }
      printTree(rootPath, '');
      break;
    }

    case 'theme': {
      let html = '';
      // Try live iframe first, then fall back to localStorage
      try {
        const iframe = document.querySelector('iframe[title="Theme Canvas"]');
        if (iframe?.contentDocument) {
          const iframeHTML = iframe.contentDocument.documentElement.outerHTML;
          if (iframeHTML && iframeHTML.length > 50) html = iframeHTML;
        }
      } catch { /* ignore */ }
      if (!html) {
        try { html = localStorage.getItem('webeditr_project') || ''; } catch { /* ignore */ }
      }

      if (!html) {
        printErr('No theme loaded. Open a theme in the editor first.');
        break;
      }

      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title   = titleMatch ? titleMatch[1].trim() : '(no title)';
      const sizeKB  = (new Blob([html]).size / 1024).toFixed(2);

      // Use DOMParser for accurate counts
      let elements = 0, links = 0, images = 0, scripts = 0, styles = 0;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        elements = doc.querySelectorAll('*').length;
        links    = doc.querySelectorAll('a').length;
        images   = doc.querySelectorAll('img').length;
        scripts  = doc.querySelectorAll('script').length;
        styles   = doc.querySelectorAll('style').length;
      } catch {
        // fallback regex counts
        elements = (html.match(/<[a-z][^>]*>/gi) || []).length;
        links    = (html.match(/<a\s[^>]*>/gi) || []).length;
        images   = (html.match(/<img[^>]*>/gi) || []).length;
        scripts  = (html.match(/<script[^>]*>/gi) || []).length;
        styles   = (html.match(/<style[^>]*>/gi) || []).length;
      }

      const saved = (() => { try { return !!localStorage.getItem('webeditr_project'); } catch { return false; } })();

      println();
      println(`${BOLD}${CYAN}╔═════════════ Current Theme Info ════════════╗${RESET}`);
      println();
      println(`  ${DIM}Title   ${RESET}${YELLOW}${title}${RESET}`);
      println(`  ${DIM}Size    ${RESET}${sizeKB} KB`);
      println(`  ${DIM}Elements${RESET}${elements}`);
      println(`  ${DIM}Links   ${RESET}${links}`);
      println(`  ${DIM}Images  ${RESET}${images}`);
      println(`  ${DIM}Scripts ${RESET}${scripts}`);
      println(`  ${DIM}Styles  ${RESET}${styles} <style> block(s)`);
      println(`  ${DIM}Storage ${RESET}${saved ? GREEN + '● Saved in localStorage' + RESET : RED + '○ Not saved' + RESET}`);
      println();
      println(`${BOLD}${CYAN}╚═════════════════════════════════════════════╝${RESET}`);
      break;
    }

    case 'export': {
      let html = '';
      try { html = localStorage.getItem('webeditr_project') || ''; } catch { /* ignore */ }

      if (!html) {
        printErr('No theme found. Open a theme in the editor first.');
        break;
      }
      try {
        const blob = new Blob([html], { type: 'text/html' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        println(`${GREEN}✓ Exported index.html (${(blob.size / 1024).toFixed(2)} KB)${RESET}`);
      } catch (e) {
        printErr('Export failed: ' + e.message);
      }
      break;
    }

    case 'logs': {
      const logs = errorLogsRef.current;
      if (logs.length === 0) {
        println(`${DIM}No errors logged. All clear!${RESET}`);
        break;
      }
      println();
      println(`${BOLD}${RED}╔═══════════════ Error Log (${logs.length}) ═══════════════╗${RESET}`);
      println();
      logs.forEach((entry, i) => {
        const num = String(i + 1).padStart(3, ' ');
        const ctxColor = entry.context === 'runtime' ? RED
                       : entry.context === 'promise'  ? YELLOW
                       : MAGENTA;
        println(`${DIM}${num}.${RESET} ${ctxColor}[${entry.context}]${RESET} ${DIM}${entry.time}${RESET}`);
        println(`     ${entry.message}`);
        if (entry.stack) {
          const stackLines = entry.stack.split('\n').slice(1, 4);   // first 3 frames
          for (const frame of stackLines) {
            println(`     ${DIM}${frame.trim()}${RESET}`);
          }
        }
        if (i < logs.length - 1) println(`${DIM}     ─────────────────────────────────${RESET}`);
      });
      println();
      println(`${DIM}Type ${RESET}${CYAN}logs:clear${RESET}${DIM} to clear the log.${RESET}`);
      break;
    }

    case 'logs:clear': {
      errorLogsRef.current = [];
      onErrorCountChange(0);
      println(`${GREEN}✓ Error logs cleared.${RESET}`);
      break;
    }

    case 'history': {
      const hist = histRef.current;
      if (hist.length === 0) { println(`${DIM}No commands in history.${RESET}`); break; }
      println();
      const reversed = [...hist].reverse();
      reversed.forEach((entry, i) => {
        println(`${DIM}${String(i + 1).padStart(4, ' ')}${RESET}  ${entry}`);
      });
      break;
    }

    case 'clear':
    case 'cls': {
      break;   // handled before this function
    }

    case '': {
      break;
    }

    case 'ai': {
      const subArgs = args.slice(1);

      if (subArgs.length === 0) {
        println();
        println(`${BOLD}${CYAN}╔═══════════════ AI Builder Commands ════════════╗${RESET}`);
        println();
        println(`  ${GREEN}ai ${CYAN}"<prompt>"${RESET}       ${DIM}Generate code with AI${RESET}`);
        println(`  ${GREEN}ai site ${CYAN}"<desc>"${RESET}    ${DIM}Generate a full site${RESET}`);
        println(`  ${GREEN}ai code ${CYAN}"<desc>"${RESET}    ${DIM}Generate a code snippet${RESET}`);
        println();
        println(`${BOLD}  Examples:${RESET}`);
        println(`  ${DIM}ai "create a hero section with gradient background"${RESET}`);
        println(`  ${DIM}ai site "modern restaurant with dark theme"${RESET}`);
        println(`  ${DIM}ai code "responsive 3-column pricing table"${RESET}`);
        println();
        println(`${MAGENTA}  Tip:${RESET} Open ${BOLD}Eklentiler → AI Builder${RESET} to configure your API key`);
        println();
        println(`${BOLD}${CYAN}╚════════════════════════════════════════════════╝${RESET}`);
        break;
      }

      // Collect the prompt (strip leading 'site' / 'code' mode keyword)
      let mode = 'code';
      let promptWords = subArgs;
      if (subArgs[0] === 'site') { mode = 'site'; promptWords = subArgs.slice(1); }
      else if (subArgs[0] === 'code') { promptWords = subArgs.slice(1); }

      const fullPrompt = promptWords.join(' ').replace(/^["']|["']$/g, '').trim();

      if (!fullPrompt) {
        println(`${RED}Usage: ai "<prompt>"${RESET}`);
        break;
      }

      // Check AI is configured
      let aiConfig = null;
      try { aiConfig = JSON.parse(localStorage.getItem('webeditr_ai_config') || 'null'); } catch { /* */ }

      if (!aiConfig) {
        println(`${YELLOW}⚠ AI Builder henüz yapılandırılmamış.${RESET}`);
        println(`${DIM}Yapılandırmak için: ${RESET}${CYAN}Eklentiler → AI Builder${RESET}`);
        break;
      }

      println(`${CYAN}🤖 AI isteği kuyruğa alındı: ${RESET}"${fullPrompt}"`);
      println(`${DIM}   Mod: ${mode} · Model: ${aiConfig.selectedModel}${RESET}`);

      // Queue the prompt for AIBuilderPlugin to pick up on next open
      try {
        localStorage.setItem('webeditr_ai_terminal_prompt', fullPrompt);
        localStorage.setItem('webeditr_ai_terminal_mode', mode);
      } catch { /* ignore */ }

      println(`${GREEN}✓ Hazır!${RESET} ${DIM}Uygulamak için: ${RESET}${BOLD}Eklentiler → AI Builder${RESET}`);
      break;
    }

    case 'git': {
      const gitArgs = args.slice(1);

      if (gitArgs.length === 0) {
        println();
        println(`${BOLD}${CYAN}Git Commands:${RESET}`);
        println();
        println(`  ${GREEN}git init              ${DIM}Initialize repository${RESET}`);
        println(`  ${GREEN}git status            ${DIM}Show working tree status${RESET}`);
        println(`  ${GREEN}git add <file>        ${DIM}Stage file (use . for all)${RESET}`);
        println(`  ${GREEN}git commit -m "msg"   ${DIM}Commit staged changes${RESET}`);
        println(`  ${GREEN}git log               ${DIM}Show commit history${RESET}`);
        println(`  ${GREEN}git branch            ${DIM}List branches${RESET}`);
        println(`  ${GREEN}git branch <name>     ${DIM}Create branch${RESET}`);
        println(`  ${GREEN}git checkout <name>   ${DIM}Switch branch${RESET}`);
        println(`  ${GREEN}git push              ${DIM}Push to remote (simulated)${RESET}`);
        println(`  ${GREEN}git pull              ${DIM}Pull from remote (simulated)${RESET}`);
        println();
        println(`${YELLOW}Note: Simulated git — state saved to localStorage${RESET}`);
        break;
      }

      const getGitState = () => {
        try {
          const s = localStorage.getItem('webeditr_git_state');
          return s ? JSON.parse(s) : { initialized: false, branches: [], currentBranch: null, commits: [], staged: [] };
        } catch { return { initialized: false, branches: [], currentBranch: null, commits: [], staged: [] }; }
      };
      const saveGitState = (state) => {
        try { localStorage.setItem('webeditr_git_state', JSON.stringify(state)); } catch { /* */ }
      };

      let gitState = getGitState();
      const gitSub = gitArgs[0];

      switch (gitSub) {
        case 'init':
          if (gitState.initialized) {
            println(`${YELLOW}Reinitialized existing git repository${RESET}`);
          } else {
            gitState = { initialized: true, branches: ['main'], currentBranch: 'main', commits: [], staged: [] };
            saveGitState(gitState);
            println(`${GREEN}✓ Initialized empty git repository${RESET}`);
          }
          break;

        case 'status':
          if (!gitState.initialized) { println(`${RED}Not a git repository. Run 'git init'${RESET}`); break; }
          println(`${CYAN}On branch ${gitState.currentBranch}${RESET}`);
          if (gitState.staged.length > 0) {
            println();
            println(`${GREEN}Changes to be committed:${RESET}`);
            gitState.staged.forEach(f => println(`  ${GREEN}modified:   ${f}${RESET}`));
          } else {
            println(`${YELLOW}Nothing to commit, working tree clean${RESET}`);
          }
          break;

        case 'add': {
          if (!gitState.initialized) { println(`${RED}Not a git repository${RESET}`); break; }
          const fileToAdd = gitArgs[1] || '.';
          const filesToStage = fileToAdd === '.' ? ['/project/index.html', '/project/styles.css'] : [fileToAdd];
          filesToStage.forEach(f => { if (!gitState.staged.includes(f)) gitState.staged.push(f); });
          saveGitState(gitState);
          println(`${GREEN}✓ Staged ${fileToAdd}${RESET}`);
          break;
        }

        case 'commit': {
          if (!gitState.initialized) { println(`${RED}Not a git repository${RESET}`); break; }
          if (gitState.staged.length === 0) { println(`${YELLOW}Nothing to commit (use "git add" first)${RESET}`); break; }
          const mIdx = gitArgs.indexOf('-m');
          const message = mIdx !== -1 && gitArgs[mIdx + 1]
            ? gitArgs.slice(mIdx + 1).join(' ').replace(/^["']|["']$/g, '')
            : 'Update';
          const hash = Math.random().toString(36).substring(2, 9);
          const commit = { hash, message, files: [...gitState.staged], timestamp: new Date().toISOString(), branch: gitState.currentBranch };
          gitState.commits.push(commit);
          gitState.staged = [];
          saveGitState(gitState);
          println(`${GREEN}[${gitState.currentBranch} ${hash}] ${message}${RESET}`);
          println(`${GREEN}${commit.files.length} file(s) changed${RESET}`);
          break;
        }

        case 'log':
          if (!gitState.initialized || gitState.commits.length === 0) { println(`${YELLOW}No commits yet${RESET}`); break; }
          [...gitState.commits].reverse().forEach(c => {
            println(`${YELLOW}commit ${c.hash}${RESET}`);
            println(`Date:   ${new Date(c.timestamp).toLocaleString()}`);
            println();
            println(`    ${c.message}`);
            println();
          });
          break;

        case 'branch':
          if (!gitState.initialized) { println(`${RED}Not a git repository${RESET}`); break; }
          if (gitArgs.length === 1) {
            gitState.branches.forEach(b => {
              const cur = b === gitState.currentBranch;
              println(`${cur ? GREEN : RESET}${cur ? '* ' : '  '}${b}${RESET}`);
            });
          } else {
            const nb = gitArgs[1];
            if (gitState.branches.includes(nb)) {
              println(`${RED}fatal: A branch named '${nb}' already exists${RESET}`);
            } else {
              gitState.branches.push(nb);
              saveGitState(gitState);
              println(`${GREEN}✓ Created branch '${nb}'${RESET}`);
            }
          }
          break;

        case 'checkout': {
          if (!gitState.initialized) { println(`${RED}Not a git repository${RESET}`); break; }
          const target = gitArgs[1];
          if (!target) { println(`${RED}Specify branch name${RESET}`); break; }
          if (!gitState.branches.includes(target)) {
            println(`${RED}error: pathspec '${target}' did not match any branch${RESET}`);
          } else {
            gitState.currentBranch = target;
            saveGitState(gitState);
            println(`${GREEN}Switched to branch '${target}'${RESET}`);
          }
          break;
        }

        case 'push':
          if (!gitState.initialized) { println(`${RED}Not a git repository${RESET}`); break; }
          println(`${CYAN}Pushing to origin/${gitState.currentBranch}...${RESET}`);
          println(`${GREEN}✓ Successfully pushed to origin/${gitState.currentBranch}${RESET}`);
          break;

        case 'pull':
          if (!gitState.initialized) { println(`${RED}Not a git repository${RESET}`); break; }
          println(`${CYAN}Pulling from origin/${gitState.currentBranch}...${RESET}`);
          println(`${GREEN}Already up to date.${RESET}`);
          break;

        default:
          println(`${RED}git: '${gitSub}' is not a git command${RESET}`);
          println(`Run ${CYAN}git${RESET} to see available commands`);
      }
      break;
    }

    case 'npm': {
      const npmArgs = args.slice(1);

      if (npmArgs.length === 0) {
        println();
        println(`${BOLD}${CYAN}npm Commands:${RESET}`);
        println();
        println(`  ${GREEN}npm init              ${DIM}Create package.json${RESET}`);
        println(`  ${GREEN}npm install <pkg>     ${DIM}Install package (simulated)${RESET}`);
        println(`  ${GREEN}npm uninstall <pkg>   ${DIM}Remove package${RESET}`);
        println(`  ${GREEN}npm list              ${DIM}List installed packages${RESET}`);
        println(`  ${GREEN}npm run <script>      ${DIM}Run package script${RESET}`);
        println();
        println(`${YELLOW}Note: Simulated npm — saved to localStorage${RESET}`);
        break;
      }

      const getPkgJson = () => {
        try {
          const s = localStorage.getItem('webeditr_package_json');
          return s ? JSON.parse(s) : null;
        } catch { return null; }
      };
      const savePkgJson = (p) => {
        try { localStorage.setItem('webeditr_package_json', JSON.stringify(p, null, 2)); } catch { /* */ }
      };

      const npmSub = npmArgs[0];

      switch (npmSub) {
        case 'init': {
          const pkg = {
            name: 'webeditr-project',
            version: '1.0.0',
            description: 'WebEdit-r project',
            scripts: { dev: 'Open in browser', build: 'Export HTML', test: 'echo "No tests yet"' },
            dependencies: {},
            devDependencies: {},
          };
          savePkgJson(pkg);
          println(`${GREEN}Wrote to package.json:${RESET}`);
          println(`${DIM}${JSON.stringify({ name: pkg.name, version: pkg.version }, null, 2)}${RESET}`);
          break;
        }

        case 'install':
        case 'i': {
          const pkgJson = getPkgJson();
          if (!pkgJson) { println(`${RED}npm error: No package.json found. Run 'npm init'${RESET}`); break; }
          const pkgName = npmArgs[1];
          if (!pkgName) { println(`${YELLOW}Usage: npm install <package>${RESET}`); break; }
          if (pkgJson.dependencies[pkgName]) { println(`${YELLOW}${pkgName} is already listed as a dependency${RESET}`); break; }
          const ver = npmArgs[2] || '1.0.0';
          pkgJson.dependencies[pkgName] = `^${ver}`;
          savePkgJson(pkgJson);
          println(`${CYAN}added 1 package: ${GREEN}${pkgName}@${ver}${RESET}`);
          println(`${GREEN}✓ found 0 vulnerabilities${RESET}`);
          break;
        }

        case 'uninstall':
        case 'un': {
          const pkgJson = getPkgJson();
          if (!pkgJson) { println(`${RED}npm error: No package.json found${RESET}`); break; }
          const pkgName = npmArgs[1];
          if (!pkgName) { println(`${YELLOW}Usage: npm uninstall <package>${RESET}`); break; }
          if (pkgJson.dependencies[pkgName]) {
            delete pkgJson.dependencies[pkgName];
            savePkgJson(pkgJson);
            println(`${GREEN}✓ removed ${pkgName}${RESET}`);
          } else {
            println(`${YELLOW}Package '${pkgName}' is not in your dependencies${RESET}`);
          }
          break;
        }

        case 'list':
        case 'ls': {
          const pkgJson = getPkgJson();
          if (!pkgJson) { println(`${RED}npm error: No package.json found${RESET}`); break; }
          const deps = Object.entries(pkgJson.dependencies);
          println(`${CYAN}${pkgJson.name}@${pkgJson.version}${RESET}`);
          if (deps.length === 0) {
            println(`${DIM}(empty)${RESET}`);
          } else {
            deps.forEach(([n, v]) => println(`  ${GREEN}${n}${RESET}@${v}`));
          }
          break;
        }

        case 'run': {
          const pkgJson = getPkgJson();
          if (!pkgJson) { println(`${RED}npm error: No package.json found${RESET}`); break; }
          const scriptName = npmArgs[1];
          if (!scriptName) {
            println(`${CYAN}Scripts available:${RESET}`);
            Object.entries(pkgJson.scripts).forEach(([n, c]) => println(`  ${GREEN}${n}${RESET}: ${c}`));
          } else if (pkgJson.scripts[scriptName]) {
            println(`${GREEN}> ${pkgJson.name}@${pkgJson.version} ${scriptName}${RESET}`);
            println(`${GREEN}> ${pkgJson.scripts[scriptName]}${RESET}`);
          } else {
            println(`${RED}npm error: Missing script: "${scriptName}"${RESET}`);
          }
          break;
        }

        default:
          println(`${RED}npm: unknown command "${npmSub}"${RESET}`);
          println(`Run ${CYAN}npm${RESET} to see available commands`);
      }
      break;
    }

    case 'wget':
    case 'curl': {
      const fetchUrl = args[1];
      if (!fetchUrl) { println(`${RED}${cmd}: missing URL${RESET}`); break; }
      println(`${CYAN}${cmd === 'curl' ? 'Fetching' : 'Downloading'} ${fetchUrl}...${RESET}`);
      println(`${YELLOW}(Simulated — no actual network request in editor mode)${RESET}`);
      break;
    }

    case 'ping': {
      const pingHost = args[1];
      if (!pingHost) { println(`${RED}ping: missing host${RESET}`); break; }
      println(`${CYAN}PING ${pingHost} (simulated)${RESET}`);
      for (let i = 1; i <= 4; i++) {
        const ms = Math.floor(Math.random() * 40) + 8;
        println(`64 bytes from ${pingHost}: icmp_seq=${i} ttl=64 time=${ms} ms`);
      }
      println();
      println(`${GREEN}--- ${pingHost} ping statistics ---${RESET}`);
      println(`4 packets transmitted, 4 received, 0% packet loss`);
      break;
    }

    case 'whoami': {
      println(`${GREEN}webeditr-user${RESET}`);
      break;
    }

    case 'date': {
      println(new Date().toString());
      break;
    }

    case 'uptime': {
      const elapsed = Math.floor((Date.now() - TERMINAL_START_TIME) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      println(`${GREEN}Terminal uptime: ${mins}m ${secs}s${RESET}`);
      break;
    }

    default: {
      println(`${RED}${cmd}${RESET}${DIM}: command not found. Type ${RESET}${CYAN}help${RESET}${DIM} for available commands.${RESET}`);
    }
  }
}

// ── Tab completion ─────────────────────────────────────────────────────────────
const ALL_COMMANDS = [
  'help', 'ls', 'cd', 'pwd', 'cat', 'tree',
  'theme', 'export', 'history', 'clear', 'logs', 'logs:clear', 'ai',
  'git', 'npm', 'wget', 'curl', 'ping', 'whoami', 'date', 'uptime',
];

function tabComplete(input, cwd, fs) {
  const parts = input.split(/\s+/);

  if (parts.length === 1) {
    const prefix  = parts[0];
    const matches = ALL_COMMANDS.filter(c => c.startsWith(prefix));
    return { matches, completed: matches.length === 1 ? matches[0] + ' ' : null };
  }

  const pathArg = parts[parts.length - 1];
  const slash   = pathArg.lastIndexOf('/');
  const dirPart  = slash >= 0 ? pathArg.slice(0, slash + 1) : '';
  const filePart = slash >= 0 ? pathArg.slice(slash + 1) : pathArg;

  const dirResolved = dirPart
    ? resolvePath(cwd, dirPart.endsWith('/') ? dirPart.slice(0, -1) || '/' : dirPart)
    : cwd;

  const dirNode = fs[dirResolved];
  if (!dirNode || dirNode.type !== 'dir') return { matches: [], completed: null };

  const matches = dirNode.children.filter(c => c.startsWith(filePart));
  if (matches.length === 1) {
    const childPath = dirResolved === '/' ? '/' + matches[0] : dirResolved + '/' + matches[0];
    const isDir = fs[childPath]?.type === 'dir';
    const completedArg = dirPart + matches[0] + (isDir ? '/' : ' ');
    return { matches, completed: [...parts.slice(0, -1), completedArg].join(' ') };
  }
  return { matches, completed: null };
}

// ── Component ──────────────────────────────────────────────────────────────────
const TerminalTab = () => {
  const terminalRef    = useRef(null);
  const xtermRef       = useRef(null);
  const fitAddonRef    = useRef(null);
  const cwdRef         = useRef('');
  const inputBufferRef = useRef('');
  const cursorPosRef   = useRef(0);
  const historyRef     = useRef([]);
  const historyIdxRef  = useRef(-1);
  const runningRef     = useRef(false);
  const fsRef          = useRef(null);
  const errorLogsRef   = useRef([]);               // accumulated error entries

  const [isRunning,   setIsRunning]   = useState(false);
  const [errorCount,  setErrorCount]  = useState(0);  // drives the badge

  // ── Helper: push an error into the log ──────────────────────────────────────
  const pushErrorLog = useCallback((err, context = 'runtime') => {
    const entry = {
      time:    new Date().toLocaleTimeString(),
      context,
      message: (err && err.message) ? err.message : String(err),
      stack:   (err && err.stack)   ? err.stack   : undefined,
    };
    errorLogsRef.current = [...errorLogsRef.current, entry];
    setErrorCount(errorLogsRef.current.length);

    // If the terminal is visible and idle, print a one-liner hint
    const term = xtermRef.current;
    if (term && !runningRef.current && inputBufferRef.current === '') {
      term.writeln(`\r\n${RED}● Error captured [${context}]:${RESET} ${DIM}${entry.message}${RESET} ${DIM}(type logs)${RESET}`);
      writePromptDirect(term, cwdRef.current);
    }
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Prompt helpers ───────────────────────────────────────────────────────────
  const writePrompt = useCallback((term, cwd) => {
    const dir = cwd || cwdRef.current;
    term.write(`\r\n${BOLD}${GREEN}webedit-r${RESET} ${BLUE}${displayPath(dir)}${RESET} ${CYAN}>${RESET} `);
  }, []);

  function writePromptDirect(term, cwd) {
    const dir = cwd || '/';
    term.write(`\r\n${BOLD}${GREEN}webedit-r${RESET} ${BLUE}${displayPath(dir)}${RESET} ${CYAN}>${RESET} `);
  }

  const redrawInput = useCallback((term) => {
    term.write('\r\x1b[K');
    term.write(`${BOLD}${GREEN}webedit-r${RESET} ${BLUE}${displayPath(cwdRef.current)}${RESET} ${CYAN}>${RESET} `);
    term.write(inputBufferRef.current);
    const pos = cursorPosRef.current;
    const len = inputBufferRef.current.length;
    if (pos < len) term.write(`\x1b[${len - pos}D`);
  }, []);

  // ── Global error / promise rejection capture ─────────────────────────────────
  useEffect(() => {
    const onError = (ev) => {
      if (ev.error) pushErrorLog(ev.error, 'runtime');
    };
    const onRejection = (ev) => {
      pushErrorLog(ev.reason ?? 'Unhandled promise rejection', 'promise');
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [pushErrorLog]);

  // ── console.error capture ────────────────────────────────────────────────────
  useEffect(() => {
    const origError = console.error.bind(console);
    console.error = (...args) => {
      origError(...args);
      // Skip React's own internal warnings (they flood the log)
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      if (msg.includes('Warning:') || msg.includes('Each child in a list')) return;
      pushErrorLog({ message: msg }, 'console');
    };
    return () => { console.error = origError; };
  }, [pushErrorLog]);

  // ── Main xterm useEffect ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Cascadia Code", "Cascadia Mono", Consolas, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e', foreground: '#d4d4d4', cursor: '#aeafad', cursorAccent: '#1e1e1e',
        selectionBackground: 'rgba(255,255,255,0.25)',
        black: '#000000',   red: '#cd3131',   green: '#0dbc79', yellow: '#e5e510',
        blue: '#2472c8',    magenta: '#bc3fbc', cyan: '#11a8cd', white: '#e5e5e5',
        brightBlack: '#666666', brightRed: '#f14c4c', brightGreen: '#23d18b',
        brightYellow: '#f5f543', brightBlue: '#3b8eea', brightMagenta: '#d670d6',
        brightCyan: '#29b8db', brightWhite: '#e5e5e5',
      },
      scrollback: 10000,
      allowProposedApi: true,
      convertEol: false,
    });

    const fitAddon      = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);

    xtermRef.current    = term;
    fitAddonRef.current = fitAddon;

    // ── Electron path ──────────────────────────────────────────────────────────
    if (window.terminalAPI) {
      window.terminalAPI.onReady(({ cwd, shell }) => {
        cwdRef.current = cwd;
        term.writeln(`${BOLD}${GREEN}WebEdit-r Terminal${RESET}  ${DIM}(${shell})${RESET}`);
        term.writeln(`${DIM}Type any command and press Enter. Ctrl+C interrupts.${RESET}`);
        writePrompt(term, cwd);
      });
      window.terminalAPI.onOutput((data) => term.write(data));
      window.terminalAPI.onCwd((newCwd) => { cwdRef.current = newCwd; });
      window.terminalAPI.onCommandDone(({ exitCode }) => {
        runningRef.current = false;
        setIsRunning(false);
        if (exitCode !== 0) term.write(`\r\n${DIM}[exit: ${exitCode}]${RESET}`);
        writePrompt(term, cwdRef.current);
        inputBufferRef.current = '';
        cursorPosRef.current   = 0;
      });
      window.terminalAPI.start(undefined);

    } else {
      // ── Virtual filesystem path ──────────────────────────────────────────────
      fsRef.current       = buildVirtualFS();
      cwdRef.current      = '/';
      writeStartupGuide(term);
      writePrompt(term, '/');
    }

    // ── Shared key handler ─────────────────────────────────────────────────────
    term.onKey(({ key, domEvent: ev }) => {

      if (ev.ctrlKey && ev.key === 'c') {
        if (runningRef.current) { window.terminalAPI?.interrupt(); term.write('^C'); }
        else {
          term.write('^C');
          inputBufferRef.current = '';
          cursorPosRef.current   = 0;
          writePrompt(term, cwdRef.current);
        }
        return;
      }

      if (ev.ctrlKey && ev.key === 'l') { term.clear(); redrawInput(term); return; }

      if (runningRef.current) return;

      // Enter
      if (ev.key === 'Enter') {
        const cmd = inputBufferRef.current.trim();
        inputBufferRef.current = '';
        cursorPosRef.current   = 0;
        historyIdxRef.current  = -1;
        term.write('\r\n');

        if (cmd === '') { writePrompt(term, cwdRef.current); return; }

        const hist = historyRef.current;
        if (hist[0] !== cmd) hist.unshift(cmd);
        if (hist.length > 200) hist.pop();

        if (cmd === 'clear' || cmd === 'cls') {
          term.clear();
          writePrompt(term, cwdRef.current);
          return;
        }

        if (window.terminalAPI) {
          runningRef.current = true;
          setIsRunning(true);
          window.terminalAPI.run(cmd, cwdRef.current);
        } else {
          executeVirtualCommand(
            term, cmd, fsRef.current, cwdRef, historyRef,
            errorLogsRef, setErrorCount
          );
          writePrompt(term, cwdRef.current);
        }
        return;
      }

      // Tab — auto-complete (virtual mode only)
      if (ev.key === 'Tab') {
        if (!window.terminalAPI && fsRef.current) {
          const { matches, completed } = tabComplete(
            inputBufferRef.current, cwdRef.current, fsRef.current
          );
          if (completed !== null) {
            inputBufferRef.current = completed;
            cursorPosRef.current   = completed.length;
            redrawInput(term);
          } else if (matches.length > 1) {
            term.write('\r\n');
            term.write(matches.map(m => `${CYAN}${m}${RESET}`).join('  '));
            redrawInput(term);
          }
        }
        return;
      }

      // Backspace
      if (ev.key === 'Backspace') {
        const buf = inputBufferRef.current, pos = cursorPosRef.current;
        if (pos > 0) {
          inputBufferRef.current = buf.slice(0, pos - 1) + buf.slice(pos);
          cursorPosRef.current   = pos - 1;
          redrawInput(term);
        }
        return;
      }

      // Delete
      if (ev.key === 'Delete') {
        const buf = inputBufferRef.current, pos = cursorPosRef.current;
        if (pos < buf.length) {
          inputBufferRef.current = buf.slice(0, pos) + buf.slice(pos + 1);
          redrawInput(term);
        }
        return;
      }

      if (ev.key === 'ArrowLeft')  { if (cursorPosRef.current > 0) { cursorPosRef.current--; term.write('\x1b[D'); } return; }
      if (ev.key === 'ArrowRight') { if (cursorPosRef.current < inputBufferRef.current.length) { cursorPosRef.current++; term.write('\x1b[C'); } return; }

      // Arrow Up — history prev
      if (ev.key === 'ArrowUp') {
        const hist = historyRef.current;
        const newIdx = Math.min(historyIdxRef.current + 1, hist.length - 1);
        if (newIdx >= 0 && hist[newIdx] !== undefined) {
          historyIdxRef.current  = newIdx;
          inputBufferRef.current = hist[newIdx];
          cursorPosRef.current   = hist[newIdx].length;
          redrawInput(term);
        }
        return;
      }

      // Arrow Down — history next
      if (ev.key === 'ArrowDown') {
        const newIdx = historyIdxRef.current - 1;
        if (newIdx < 0) {
          historyIdxRef.current  = -1;
          inputBufferRef.current = '';
          cursorPosRef.current   = 0;
          redrawInput(term);
        } else {
          historyIdxRef.current  = newIdx;
          inputBufferRef.current = historyRef.current[newIdx];
          cursorPosRef.current   = historyRef.current[newIdx].length;
          redrawInput(term);
        }
        return;
      }

      if (ev.key === 'Home') {
        const m = cursorPosRef.current;
        if (m > 0) { cursorPosRef.current = 0; term.write(`\x1b[${m}D`); }
        return;
      }
      if (ev.key === 'End') {
        const m = inputBufferRef.current.length - cursorPosRef.current;
        if (m > 0) { cursorPosRef.current = inputBufferRef.current.length; term.write(`\x1b[${m}C`); }
        return;
      }

      if (ev.ctrlKey || ev.altKey || ev.metaKey) return;
      if (ev.key.length > 1) return;

      // Printable char — insert at cursor
      const buf = inputBufferRef.current, pos = cursorPosRef.current;
      inputBufferRef.current = buf.slice(0, pos) + key + buf.slice(pos);
      cursorPosRef.current   = pos + 1;
      if (pos === buf.length) term.write(key);
      else redrawInput(term);
    });

    // ── Resize ─────────────────────────────────────────────────────────────────
    const handleResize = () => { if (fitAddonRef.current) fitAddonRef.current.fit(); };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.terminalAPI?.kill();
      term.dispose();
    };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const handleClear = () => { if (xtermRef.current) xtermRef.current.clear(); };

  const handleRestart = () => {
    if (!xtermRef.current) return;
    const term = xtermRef.current;
    term.clear();
    runningRef.current     = false;
    setIsRunning(false);
    inputBufferRef.current = '';
    cursorPosRef.current   = 0;

    if (window.terminalAPI) {
      window.terminalAPI?.kill();
      window.terminalAPI?.start(cwdRef.current || undefined);
    } else {
      fsRef.current      = buildVirtualFS();
      cwdRef.current     = '/';
      historyRef.current = [];
      historyIdxRef.current = -1;
      writeStartupGuide(term);
      writePrompt(term, '/');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', background: '#1e1e1e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '8px 16px',
        background: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>Terminal</span>

          {/* READY / RUNNING badge */}
          <span style={{
            padding: '2px 8px',
            background: isRunning ? '#e5a00d' : '#0dbc79',
            color: 'white',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}>
            {isRunning ? '⟳ RUNNING' : '● READY'}
          </span>

          {/* Virtual FS mode badge */}
          {!window.terminalAPI && (
            <span style={{
              padding: '2px 8px',
              background: '#2472c8',
              color: 'white',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 600,
            }}>
              VIRTUAL FS
            </span>
          )}

          {/* Error count badge — only shown when there are errors */}
          {errorCount > 0 && (
            <span
              className="terminal-error-badge"
              style={{
                padding: '2px 8px',
                background: '#cd3131',
                color: 'white',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.3px',
                cursor: 'pointer',
                animation: 'terminalPulse 2s ease-in-out infinite',
              }}
              title="Type 'logs' to see error details"
              onClick={() => {
                if (xtermRef.current && !runningRef.current) {
                  xtermRef.current.writeln('');
                  executeVirtualCommand(
                    xtermRef.current, 'logs', fsRef.current, cwdRef,
                    historyRef, errorLogsRef, setErrorCount
                  );
                  writePrompt(xtermRef.current, cwdRef.current);
                }
              }}
            >
              ⚠ {errorCount} {errorCount === 1 ? 'ERROR' : 'ERRORS'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {isRunning && (
            <button
              onClick={() => window.terminalAPI?.interrupt()}
              style={{ padding: '5px 12px', background: '#cd3131', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
            >
              ■ Stop
            </button>
          )}
          {errorCount > 0 && (
            <button
              onClick={() => {
                errorLogsRef.current = [];
                setErrorCount(0);
              }}
              style={{ padding: '5px 12px', background: '#3e3e42', color: '#f14c4c', border: '1px solid #f14c4c', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Clear Errors
            </button>
          )}
          <button
            onClick={handleClear}
            style={{ padding: '5px 12px', background: '#3e3e42', color: '#d4d4d4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
          >
            Clear
          </button>
          <button
            onClick={handleRestart}
            style={{ padding: '5px 12px', background: '#3e3e42', color: '#d4d4d4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
          >
            Restart
          </button>
        </div>
      </div>

      {/* xterm display */}
      <div style={{ flex: 1, padding: '8px', overflow: 'hidden', minHeight: 0 }}>
        <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '4px 16px',
        background: '#007acc',
        color: 'white',
        fontSize: '11px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
      }}>
        {window.terminalAPI ? (
          <>
            <span>git · npm · node · python · any command</span>
            <span style={{ opacity: 0.7 }}>|</span>
            <span style={{ opacity: 0.8 }}>↑↓ history · Ctrl+C interrupt · Ctrl+L clear</span>
          </>
        ) : (
          <>
            <span>ls · cd · cat · tree · theme · export · logs</span>
            <span style={{ opacity: 0.7 }}>|</span>
            <span style={{ opacity: 0.8 }}>
              ↑↓ history · Tab complete · Ctrl+L clear
              {errorCount > 0 && ` · ⚠ ${errorCount} error${errorCount > 1 ? 's' : ''}`}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default TerminalTab;
