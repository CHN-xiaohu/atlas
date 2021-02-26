import { memo, useMemo, useState } from "react";
import styled from "styled-components";
import {ComposableMap, Geographies, Geography} from "react-simple-maps";
import worldmap from "../../../data/world-110m.json";
import {color} from "../../../Helper";
import {getCountryCode} from "../../../data/countries";
import {Spinner} from "../../common/Spinner";
import {useQuery} from "react-query";

const Container = styled.div`
    width: 75vw;
    margin: 0 auto;
`;

const statsSelector = leads => {
    return leads
        .filter(lead => lead.country != null)
        .map(lead => getCountryCode(lead.country))
        .reduce((stats, code) => {
            return {
                ...stats,
                [code]: stats[code] == null ? 1 : stats[code] + 1,
            };
        }, {});
};

const MapView = memo(({leads, setTooltipContent, setMousePosition}) => {
    const stats = useMemo(() => statsSelector(leads), [leads]);
    const max = Object.values(stats).reduce((a, b) => (a > b ? a : b), 0);
    return (
        <Container>
            <ComposableMap>
                <Geographies geography={worldmap}>
                    {({geographies}) =>
                        geographies.map(geo => {
                            const id = geo.properties.ISO_A2;
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="gainsboro"
                                    onMouseMove={e => setMousePosition(e.screenX, e.screenY)}
                                    onMouseEnter={() => {
                                        setTooltipContent(
                                            `${geo.properties.NAME} – ${stats[id] == null ? 0 : stats[id]}`,
                                        );
                                    }}
                                    onMouseLeave={() => {
                                        setTooltipContent("");
                                    }}
                                    style={{
                                        default: {
                                            fill: color(
                                                "blue",
                                                stats[id] == null ? -1 : Math.round((stats[id] / max) * 8),
                                            ),
                                            outline: "none",
                                        },
                                        hover: {
                                            fill: color("blue"),
                                            stroke: color("blue"),
                                            strokeWidth: 0.75,
                                            outline: "none",
                                            transition: "all 250ms",
                                        },
                                        pressed: {
                                            fill: color("blue"),
                                            stroke: color("blue"),
                                            outline: "none",
                                        },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        </Container>
    );
});

const Tooltip = styled.div`
    display: inline-block;
    padding: 0.8rem;
    color: white;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 10%;
    position: absolute;
    left: ${props => props.x}px;
    top: ${props => props.y}px;
`;

export const Countries = memo(() => {
    const {data: leads, isLoading} = useQuery(['leads'])

    const [content, setContent] = useState("");
    const [mousePosition, setMousePosition] = useState({});
    if (isLoading || !Array.isArray(leads)) {
        return <Spinner />;
    }
    return (
        <div>
            <MapView
                leads={leads}
                setTooltipContent={setContent}
                setMousePosition={(x, y) => setMousePosition({x, y})}
            />
            {content.length > 0 && (
                <Tooltip x={mousePosition.x} y={mousePosition.y}>
                    {content}
                </Tooltip>
            )}
        </div>
    );
});
