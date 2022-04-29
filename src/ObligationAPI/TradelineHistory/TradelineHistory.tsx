import { ObligationType } from "@levelcredit/js-lib-api/Obligation/types";
import React, { useEffect, useState } from "react";
import injectSheet, { Styles } from "react-jss";
import useObligationTradeline from "../hooks/useObligationTradeline";
import { ObligationTradelineObject, TradelineHistoryDataStyle } from "../types";
import dayjs from "dayjs";
import getTradelineDateRange from "./utils/getTradelineDateRange";
import ReportingHistoryYear, { ReportingHistoryYearClasses } from "./ReportingHistoryYear";
import useIsMounted from "src/utils/useIsMounted";

type TradelineHistoryProps = {
  classes: {
    TradelineHistory?: string;
    TableHead?: string;
    TableColumnHead?: string;
    TableBody?: string;
    Filter?: string;
  } & ReportingHistoryYearClasses;
  obligation: ObligationType;
  obligation_id: number;

  /**
   * Default: `last-24-months`
   */
  data_style?: TradelineHistoryDataStyle;
};

const today = dayjs();
const current_year = today.year();
const months_loop = new Array(12).fill(0);

function TradelineHistory(props: TradelineHistoryProps) {
  const [tradeline, setTradeline] = useState<ObligationTradelineObject>({});
  const [show_all, setShowAll] = useState<boolean>(false);
  const mounted = useIsMounted();

  const classes = props.classes;
  const obligation = props.obligation;
  const obligation_id = props.obligation_id;
  const data_style: TradelineHistoryDataStyle = show_all ? "all" : props.data_style || "last-24-datasets";
  const fetchTradeline = useObligationTradeline();
  const { start_date, end_date } = getTradelineDateRange(Object.keys(tradeline), data_style);

  useEffect(
    function () {
      (async function () {
        const tradeline = await fetchTradeline(obligation, obligation_id);

        if (mounted.current) {
          setTradeline(tradeline);
        }
      })();
    },
    [fetchTradeline, mounted, obligation, obligation_id]
  );

  let show_more_button = !show_all;
  if (!start_date.year || start_date.year > (end_date.year || 0) - 2) {
    show_more_button = false;
  }

  return (
    <div>
      <table className={classes.TradelineHistory} cellSpacing={0}>
        <thead className={classes.TableHead}>
          <tr>
            <th className={classes.TableColumnHead} />
            {months_loop.map(function (val, i) {
              return (
                <th key={i} className={classes.TableColumnHead}>
                  {dayjs().month(i).format("MMM").charAt(0)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={classes.TableBody}>
          {new Array((end_date.year || 0) - (start_date.year || 0) + 1).fill(0).map(function (val, i) {
            return (
              <ReportingHistoryYear
                key={i}
                year={(end_date.year || current_year) - i}
                tradeline={tradeline}
                start_date={start_date}
                classes={classes}
              />
            );
          })}
        </tbody>
      </table>
      {show_more_button && (
        <div className={classes.Filter} onClick={() => setShowAll(true)}>
          Show more
        </div>
      )}
    </div>
  );
}

const styles: unknown = {
  TradelineHistory: {
    width: "100%",
  },
  TableHead: {},
  TableColumnHead: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2d3b4e",
    width: 32,
  },
  TableBody: {},
  Filter: {
    cursor: "pointer",
    marginTop: "20px",
    color: "#18b798",
  },
};

export default injectSheet(styles as Styles)(TradelineHistory);
