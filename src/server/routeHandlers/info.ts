import * as gitRev from 'git-rev';

interface Info {
  commit: string;
}

export default async function info(): Promise<Info> {
  return new Promise<Info>(resolve => {
    gitRev.short(hash => {
      resolve({
        commit: hash,
      });
    });
  });
}
