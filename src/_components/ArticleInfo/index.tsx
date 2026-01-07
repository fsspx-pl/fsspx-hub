'use client'

import { Media as MediaType } from "@/payload-types";
import Image from "next/image";
import React from "react";
import { DateLabel, DateWithTooltip } from "./DateTooltip";
import Clock from "./clock.svg";
import Pencil from "./pencil.svg";

type Props = {
  author?: string;
  avatar?: MediaType | null;
  createdAt: string;
  updatedAt: string;
  noDates?: boolean;
};

export const ArticleInfo: React.FC<Props> = ({
  author,
  avatar,
  createdAt,
  updatedAt,
  noDates = false,
}) => {
  return (
    <div
      className="flex items-center gap-2 whitespace-nowrap text-[var(--text-primary)]"
    >
      {author && avatar?.url && (
        <Image
          src={avatar.url}
          alt={author}
          className="rounded-full h-full"
          width={30}
          height={30}
        />
      )}
      <span>{author}</span>
      {!noDates && <div className="flex flex-row text-[var(--text-secondary)] gap-4 ml-2">
        {!updatedAt && (<div className="hidden sm:flex items-center gap-2">
          <DateWithTooltip
            icon={Clock}
            label={DateLabel.CREATED}
            date={createdAt}
          />
        </div>)}
        {updatedAt && (
          <div className="hidden sm:flex items-center gap-2">
            {updatedAt && (
              <DateWithTooltip
                icon={Pencil}
                label={DateLabel.UPDATED}
                date={updatedAt}
              />
            )}
          </div>
        )}
      </div>}
    </div>
  );
};


