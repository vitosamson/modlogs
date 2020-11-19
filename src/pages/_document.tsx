import Document, { Html, Head, Main, NextScript } from 'next/document';
import { isDev } from '../config';

export default class ModlogsDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.0.13/css/all.css"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,600,700&subset=all"
          />
        </Head>
        <body>
          <Main />
          <NextScript />

          {!isDev && (
            <script
              dangerouslySetInnerHTML={{
                __html:
                  '(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");',
              }}
            />
          )}
        </body>
      </Html>
    );
  }
}
