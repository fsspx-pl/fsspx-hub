'use client'

import { formatDistance, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import React from "react";
import { Tooltip } from "react-tooltip";
import { format } from "date-fns";

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
  now: string;
}> = ({ icon: Icon, label, date, now }) => {
  const inputDate = parseISO(date);
  const nowDate = parseISO(now);
  const formattedDate = formatDistance(inputDate, nowDate, {
    locale: pl,
    addSuffix: true,
  });
  const tooltip = format(inputDate, 'EEEE, d MMMM yyyy, HH:mm', { locale: pl });
  const { id } = dateConfig[label];

  return (
    <>
      <Icon className="w-4 h-4" />
      <span className="hidden lg:flex">{label}</span>
      <span id={id} className="underline">
        {formattedDate}
      </span>
      <Tooltip anchorSelect={`#${id}`} content={tooltip} />
    </>
  );
};
