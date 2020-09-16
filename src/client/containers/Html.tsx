import * as React from 'react';

const isDevelopment = process.env.NODE_ENV === 'development';

export interface Props {
  cssHref?: string;
  webpackManifest?: string;
  vendorScriptHref?: string;
  appScriptHref: string;
  asyncPropsScriptTag?: string;
  preloadedState: string;
  children: React.ReactElement<any>;
}

const Html = (props: Props) => (
  <html>
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      <title>Mod Logs</title>
      { !isDevelopment && <link rel="stylesheet" href={props.cssHref} /> }
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,600,700&subset=all" />
    </head>
    <body>
      <div id="root">
        { props.children }
      </div>

      <meta id="preloadedState" content={props.preloadedState} />
      <div id="asyncProps" dangerouslySetInnerHTML={{ __html: props.asyncPropsScriptTag }} />

      { !isDevelopment && <script
        dangerouslySetInnerHTML={{
          __html: props.webpackManifest,
        }}
      /> }

      { !isDevelopment && <script dangerouslySetInnerHTML={{
        __html: '(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");',
      }} /> }

      { !isDevelopment && <script src={props.vendorScriptHref} /> }
      <script src={props.appScriptHref} />
    </body>
  </html>
);

export default Html;
