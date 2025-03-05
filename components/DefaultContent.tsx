

import { Flight } from '@/lib/types';
import React from 'react'
import { Card, CardContent } from './ui/card';

interface DefaultContentProps {
    flight: Flight;
    currentSession: string;
}
export default function DefaultContent({
    flight,
    currentSession,
  }: DefaultContentProps) {
    return (
      <>
        <Card>
          <CardContent className="p-4 space-y-4">
            <DetailSection title="Flight Information">
              <DetailItem label="Callsign" value={flight.callsign} />
              <DetailItem label="Aircraft" value={flight.aircraft} />
              <DetailItem label="Livery" value={flight.livery} />
              <DetailItem label="Flight ID" value={flight.id} truncate />
            </DetailSection>
  
            <DetailSection title="Additional Details">
              <DetailItem label="User ID" value={flight.userId} truncate />
              <DetailItem label="Username" value={flight.username || "N/A"} />
              <DetailItem label="Organization" value={flight.org || "N/A"} />
            </DetailSection>
  
            <DetailSection title="Takeoff Times">
              {flight.takeoffTimes.length > 0 ? (
                flight.takeoffTimes.map((takeoff, index) => (
                  <DetailItem
                    key={index}
                    label={`Takeoff ${index + 1}`}
                    value={`Heading: ${takeoff.a}, Lat: ${takeoff.b}, Long: ${
                      takeoff.c
                    }, Time: ${new Date(takeoff.r).toLocaleString()}`}
                  />
                ))
              ) : (
                <DetailItem
                  label="Takeoff Times"
                  value="No takeoff times available"
                />
              )}
            </DetailSection>
  
            <DetailSection title="Landing Times">
              {flight.landingTimes.length > 0 ? (
                flight.landingTimes.map((landing, index) => (
                  <DetailItem
                    key={index}
                    label={`Landing ${index + 1}`}
                    value={`Heading: ${landing.a}, Lat: ${landing.b}, Long: ${
                      landing.c
                    }, Time: ${new Date(landing.r).toLocaleString()}`}
                  />
                ))
              ) : (
                <DetailItem
                  label="Landing Times"
                  value="No landing times available"
                />
              )}
            </DetailSection>
          </CardContent>
        </Card>
        {flight.id}
        <br />
        {currentSession}
      </>
    );
  }
  
  function DetailSection({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="space-y-2">{children}</div>
      </div>
    );
  }
  
  function DetailItem({
    label,
    value,
    truncate = false,
  }: {
    label: string;
    value: string;
    truncate?: boolean;
  }) {
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={`font-medium ${truncate ? "truncate max-w-[150px]" : ""}`}
        >
          {value}
        </span>
      </div>
    );
  }
  