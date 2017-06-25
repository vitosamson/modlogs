import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Request, Response } from 'express';

let commit: string;

try {
  const head = readFileSync(resolve(process.cwd(), '.git/HEAD')).toString().trim();

  if (/ref\:/.test(head)) {
    const ref = head.split('ref: ')[1];
    commit = readFileSync(resolve(process.cwd(), '.git', ref)).toString().trim();
  } else {
    commit = head;
  }
} catch (e) {
  commit = '';
}

export default function info(req: Request, res: Response) {
  res.json({
    commit,
  });
}
