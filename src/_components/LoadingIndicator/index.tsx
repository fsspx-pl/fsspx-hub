import React from 'react';
import HeartWithCross from './heart-with-cross.svg';
import styles from './index.module.scss';

type Props = {
  className?: string;
};

export const LoadingIndicator: React.FC<Props> = ({
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <HeartWithCross className={`${styles.animatedHeart} ${styles.loadingMask}`} />
      <HeartWithCross className={styles.backgroundHeart} />
    </div>
  );
};

export { default as HeartWithCrossIcon } from './heart-with-cross.svg';
