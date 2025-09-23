"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useMemo, useState } from "react"

// Date picker components

import { scaleSequential } from "d3-scale"
import { interpolateReds } from "d3-scale-chromatic"
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  ZoomableGroup,
} from "react-simple-maps"
import { Tooltip } from "react-tooltip"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
const RegionalHeatmap = ({
  data,
  selectedCountry,
}: {
  data: any
  selectedCountry: string
}) => {
  const [tooltipContent, setTooltipContent] = useState("")
  const [geos, setGeos] = useState<any>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  useEffect(() => {
    fetch(geoUrl)
      .then((response) => response.json())
      .then((data) => {
        setGeos(data.objects.countries.geometries)
      })
      .catch((error) => console.error("Error fetching geo data:", error))
  }, [])

  const isoToCountryNameMap: { [key: string]: string } = {
    GB: "United Kingdom",
    NG: "Nigeria",
    US: "United States of America",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    JP: "Japan",
    CN: "China",
    IN: "India",
    BR: "Brazil",
    RU: "Russia",
  }

  const countryDataMap = useMemo(() => {
    type CityData = number
    type RegionData = {
      totalEvents: number
      cities: { [city: string]: CityData }
    }
    type CountryData = {
      totalEvents: number
      regions: { [region: string]: RegionData }
    }
    const aggregatedData: { [country: string]: CountryData } = {}
    data.forEach((item: any) => {
      const countryName = isoToCountryNameMap[item.country] || item.country
      if (countryName && item.region && item.city) {
        if (!aggregatedData[countryName]) {
          aggregatedData[countryName] = { totalEvents: 0, regions: {} }
        }
        if (!aggregatedData[countryName].regions[item.region]) {
          aggregatedData[countryName].regions[item.region] = {
            totalEvents: 0,
            cities: {},
          }
        }
        if (
          !aggregatedData[countryName].regions[item.region].cities[item.city]
        ) {
          aggregatedData[countryName].regions[item.region].cities[item.city] = 0
        }
        aggregatedData[countryName].totalEvents += item.event_count
        aggregatedData[countryName].regions[item.region].totalEvents +=
          item.event_count
        aggregatedData[countryName].regions[item.region].cities[item.city] +=
          item.event_count
      }
    })
    return aggregatedData
  }, [data, isoToCountryNameMap])

  const colorScale = useMemo(() => {
    const maxEvents = Math.max(
      ...Object.values(countryDataMap).map((d: any) => d.totalEvents),
      0
    )
    return scaleSequential(interpolateReds).domain([0, maxEvents])
  }, [countryDataMap])

  const handleCountryHover = (countryName: string) =>
    setHoveredCountry(countryName)
  const handleCountryLeave = () => setHoveredCountry(null)

  if (!geos) {
    return <p className="text-center text-muted-foreground">Loading map...</p>
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
      <ComposableMap
        height={500}
        projection="geoMercator"
        data-tooltip-id="country-tooltip"
      >
        <Sphere stroke="#E4E5E6" strokeWidth={0.5} id={""} fill={""} />
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const countryName = geo.properties.name
                  const countryMetrics = (countryDataMap as any)[countryName]
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        handleCountryHover(countryName)
                        if (countryMetrics) {
                          setTooltipContent(
                            `${countryName}: ${countryMetrics.totalEvents} Events`
                          )
                        } else {
                          setTooltipContent(`${countryName}: No Data`)
                        }
                      }}
                      onMouseLeave={() => {
                        handleCountryLeave()
                        setTooltipContent("")
                      }}
                      style={{
                        default: {
                          fill: countryMetrics
                            ? colorScale(countryMetrics.totalEvents)
                            : "#DEDEDE",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: countryMetrics
                            ? colorScale(countryMetrics.totalEvents)
                            : "#DEDEDE",
                          stroke: "#2C2C2C",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                        pressed: {
                          fill: countryMetrics
                            ? colorScale(countryMetrics.totalEvents)
                            : "#DEDEDE",
                          stroke: "#2C2C2C",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                      }}
                    />
                  )
                })}
              </>
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <Tooltip id="country-tooltip" content={tooltipContent} />
      <div className="absolute top-4 left-4 z-10 w-[250px]">
        <Card className="bg-card/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle>{hoveredCountry}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total Events:{" "}
              {hoveredCountry &&
              (countryDataMap as any)[hoveredCountry]?.totalEvents
                ? (countryDataMap as any)[hoveredCountry]?.totalEvents
                : "N/A"}
            </p>
            <div className="mt-2">
              {hoveredCountry &&
                Object.entries(
                  ((countryDataMap as any)[hoveredCountry]?.regions as any) ||
                    {}
                ).map(([region, regionData]: any) => (
                  <div key={region} className="mb-2">
                    <p className="text-sm font-semibold text-muted-foreground">
                      {region}: {regionData.totalEvents} Events
                    </p>
                    <ul className="pl-4">
                      {Object.entries(regionData.cities || {}).map(
                        ([city, count]: any) => (
                          <li
                            key={city}
                            className="text-xs text-muted-foreground list-disc"
                          >
                            {city}: {count} Events
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default RegionalHeatmap
