'use client'

import { formatDistance, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import React from "react";
import { Tooltip } from "react-tooltip";

export enum DateLabel {
  CREATED = "utworzono: ",
  UPDATED = "zaktualizowano: "
}
const dateConfig = {
  [DateLabel.CREATED]: { id: "createdAt" },
  [DateLabel.UPDATED]: { id: "updatedAt" },
};
export const DateWithTooltip: React.FC<{
  icon: React.ElementType;
  label: DateLabel;
  date: string;
}> = ({ icon: Icon, label, date }) => {
  const now = new Date();
  const inputDate = parseISO(date);
  const formattedDate = formatDistance(inputDate, now, {
    locale: pl,
    addSuffix: true,
  });
  const tooltip = inputDate.toLocaleString("pl-PL", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const { id } = dateConfig[label];

  return (
    <>
      <Icon className="w-4 h-4" />
      <span className="hidden md:flex">{label}</span>
      <span id={id} className="underline">
        {formattedDate}
      </span>
      <Tooltip anchorSelect={`#${id}`} content={tooltip} />
    </>
  );
};
