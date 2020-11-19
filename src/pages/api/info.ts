import { readFileSync } from 'fs';
import { resolve } from 'path';
import { NextApiHandler } from 'next';

let commit: string;

try {
  const head = readFileSync(resolve(process.cwd(), '.git/HEAD'))
    .toString()
    .trim();

  if (/ref\:/.test(head)) {
    const ref = head.split('ref: ')[1];
    commit = readFileSync(resolve(process.cwd(), '.git', ref))
      .toString()
      .trim();
  } else {
    commit = head;
  }
} catch (e) {
  commit = 'Unable to determine commit hash';
}

const infoHandler: NextApiHandler = (req, res) => {
  res.json({ commit });
};

export default infoHandler;
