import React, { useEffect } from 'react';
import Head from 'next/head';
import App, { AppContext, AppProps } from 'next/app';
import Router from 'next/router';
import NProgress from 'nprogress';
import Header from '../components/Header';
import type { AuthResponse } from '../utils/getAuthStatus';
import type { ISubreddit } from '../models/subreddit';
import { initAnalytics, trackPage } from '../analytics';
import '../styles/main.scss';

interface Props extends AppProps {
  auth: AuthResponse;
  subreddits: ISubreddit[];
}

NProgress.configure({
  easing: 'ease',
  speed: 800,
  showSpinner: false,
  parent: '.app-container',
});

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});
Router.events.on('routeChangeComplete', () => {
  NProgress.done();
});
Router.events.on('routeChangeError', () => {
  NProgress.done();
});

export default function ModLogsApp({
  Component,
  pageProps,
  auth,
  subreddits,
  router,
}: Props) {
  useEffect(() => {
    initAnalytics();
    router.events.on('routeChangeComplete', trackPage);

    return () => {
      router.events.off('routeChangeComplete', trackPage);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Mod Logs</title>
      </Head>
      <Header username={auth.username} subreddits={subreddits} />
      <main className="app-container">
        {/* @ts-ignore not sure why TS thinks Component may render undefined */}
        <Component {...pageProps} />
      </main>
    </>
  );
}

ModLogsApp.getInitialProps = async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);
  const host = context.ctx.req ? 'http://localhost:3000/api' : '/api';

  const [authRes, subredditsRes] = await Promise.all([
    fetch(`${host}/auth?subreddit=${context.router.query.subreddit || ''}`, {
      credentials: 'same-origin',
      headers: context.ctx.req
        ? {
            cookie: context.ctx.req.headers.cookie || '',
          }
        : {},
    }),
    fetch(`${host}/subreddits`),
  ]);

  const [auth, subreddits] = await Promise.all([
    authRes.json(),
    subredditsRes.json(),
  ]);

  return {
    ...appProps,
    auth,
    subreddits,
  };
};
