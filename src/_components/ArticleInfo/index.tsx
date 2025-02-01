'use client'

import { Media as MediaType } from "@/payload-types";
import { Gothic_A1 } from "next/font/google";
import Image from "next/image";
import React from "react";
import { DateLabel, DateWithTooltip } from "./DateTooltip";
import Clock from "./clock.svg";
import Pencil from "./pencil.svg";

const gothicA1 = Gothic_A1({
  weight: "500",
  subsets: ["latin"],
});

type Props = {
  author: string;
  avatar?: MediaType | null;
  createdAt: string;
  updatedAt: string;
};

export const ArticleInfo: React.FC<Props> = ({
  author,
  avatar,
  createdAt,
  updatedAt,
}) => {
  return (
    <div
      className={`flex items-center gap-2 whitespace-nowrap ${gothicA1.className} text-gray-500`}
    >
      {avatar?.url && (
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
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};


