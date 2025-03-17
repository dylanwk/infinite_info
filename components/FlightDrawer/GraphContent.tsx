/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { GQL_Track_Type } from "@/lib/types";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export type altitudeTrack = {
  altitude: number;
  reportedTime: string;
};

export type speedTrack = {
  speed: number;
  reportedTime: string;
};

export type vsTrack = {
  vs: number;
  reportedTime: string;
};

interface GraphContentProps {
  tracks: GQL_Track_Type[];
  callsign: string;
}

export function GraphContent({ tracks, callsign }: GraphContentProps) {
  const formatReportedTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}hr:${minutes}Z`;
  };

  const altitudeData: altitudeTrack[] = tracks.map((track) => ({
    altitude: track.a,
    reportedTime: formatReportedTime(track.r),
  }));

  const speedData: speedTrack[] = tracks.map((track) => ({
    speed: track.s,
    reportedTime: formatReportedTime(track.r),
  }));

  const vsData: vsTrack[] = tracks.map((track) => ({
    vs: track.v,
    reportedTime: formatReportedTime(track.r),
  }));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Altitude</CardTitle>
          <CardDescription>{callsign}</CardDescription>
        </CardHeader>
        <CardContent className="pl-3">
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={altitudeData}
              margin={{
                right: 8,
                left: 0,
                top: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="reportedTime"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="equidistantPreserveStart"
                tickFormatter={(value) => value.slice(0, 8)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={["auto", "auto"]}
              />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="altitude"
                type="monotone"
                stroke="#000000"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Speed</CardTitle>
          <CardDescription>{callsign}</CardDescription>
        </CardHeader>
        <CardContent className="pl-3">
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={speedData}
              margin={{
                right: 8,
                left: 0,
                top: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="reportedTime"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="equidistantPreserveStart"
                tickFormatter={(value) => value.slice(0, 8)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={["auto", "auto"]}
              />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="speed"
                type="monotone"
                stroke="#000000"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vertical Speed</CardTitle>
          <CardDescription>{callsign}</CardDescription>
        </CardHeader>
        <CardContent className="pl-3">
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={vsData}
              margin={{
                right: 8,
                left: 0,
                top: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="reportedTime"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="equidistantPreserveStart"
                tickFormatter={(value) => value.slice(0, 8)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={["auto", "auto"]}
              />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="vs"
                type="monotone"
                stroke="#000000"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
