import React from 'react';
import { GetStaticProps } from 'next';
import { Container } from 'react-bootstrap';
import fs from 'fs';
import { mdToHtml } from '../../utils/markdown';
import styles from './mods.module.scss';

interface Props {
  modInstructionsHtml: string;
}

export default function ModInstructions({ modInstructionsHtml }: Props) {
  return (
    <Container style={{ marginTop: 40 }} className={styles['mod-instructions']}>
      <div dangerouslySetInnerHTML={{ __html: modInstructionsHtml }} />
    </Container>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const modInstructionsMarkdown = fs
    .readFileSync('ModeratorInstructions.md')
    .toString();
  const modInstructionsHtml = mdToHtml(modInstructionsMarkdown);

  return {
    props: {
      modInstructionsHtml,
    },
  };
};
