import { GetServerSideProps } from 'next';
import { getLogs, LogsResponse } from '../../api/logs/[subreddit]';
import LogItem from '../../../components/LogItem';
import { getAuthStatus } from '../../../utils/getAuthStatus';
import Layout from './_Layout';

interface Props extends LogsResponse {}

export default function Subreddit({
  logs,
  after,
  before,
  isAuthenticatedMod,
}: Props) {
  return (
    <Layout
      isLoading={false}
      after={after}
      before={before}
      isAuthenticatedMod={isAuthenticatedMod}
    >
      {logs.length ? (
        logs.map(log => (
          <LogItem
            log={log}
            key={log.redditId}
            isAuthenticatedMod={isAuthenticatedMod}
          />
        ))
      ) : (
        <h4 className="text-center">No logs were found :(</h4>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const { subreddit, ...query } = context.query;
  const { isAuthenticatedMod } = await getAuthStatus(
    context.req,
    subreddit as string
  );
  const logsData = await getLogs(
    subreddit as string,
    query,
    isAuthenticatedMod
  );

  return {
    props: {
      ...logsData,
      isAuthenticatedMod,
    },
  };
};
