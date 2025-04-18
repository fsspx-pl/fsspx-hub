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
  now: string;
};

export const ArticleInfo: React.FC<Props> = ({
  author,
  avatar,
  createdAt,
  updatedAt,
  now,
}) => {
  return (
    <div
      className="flex items-center gap-2 whitespace-nowrap text-gray-500"
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
      <div className="flex flex-row text-gray-400 gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <span>·</span>
          <DateWithTooltip
            icon={Clock}
            label={DateLabel.CREATED}
            date={createdAt}
            now={now}
          />
        </div>
        {updatedAt ? (
          <div className="hidden sm:flex items-center gap-2">
            <span>·</span>
            {updatedAt && (
              <DateWithTooltip
                icon={Pencil}
                label={DateLabel.UPDATED}
                date={updatedAt}
                now={now}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};


