import React from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import useSWR from 'swr';
import { ILog } from '../../../../models/log';
import LogItem from '../../../../components/LogItem';
import { getLog } from '../../../api/logs/[subreddit]/[logId]';
import { getAuthStatus } from '../../../../utils/getAuthStatus';
import Layout from '../_Layout';

interface Props {
  serverLoadedLog?: ILog;
  isAuthenticatedMod: boolean;
}

export default function LogPermalink({
  serverLoadedLog,
  isAuthenticatedMod,
}: Props) {
  const router = useRouter();
  const subreddit = router.query.subreddit as string;
  const logId = router.query.logId as string;
  const { data, isValidating } = useSWR<ILog>(
    `/api/logs/${subreddit}/${logId}`,
    { initialData: serverLoadedLog }
  );

  if (isValidating) {
    return null;
  }

  return (
    <Layout isLoading={isValidating} isAuthenticatedMod={isAuthenticatedMod}>
      {data ? (
        <LogItem log={data} isAuthenticatedMod={isAuthenticatedMod} />
      ) : (
        <h4 className="text-center">Unable to find that log :(</h4>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const subreddit = context.query.subreddit as string;
  const logId = context.query.logId as string;
  const { isAuthenticatedMod } = await getAuthStatus(context.req, subreddit);

  try {
    const log = await getLog(subreddit, logId, isAuthenticatedMod);

    return {
      props: {
        serverLoadedLog: log,
        isAuthenticatedMod,
      },
    };
  } catch {
    return {
      props: {
        isAuthenticatedMod,
      },
    };
  }
};
