import { Col, Row, Slider } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { useApiService } from "../../../contexts/ApiServiceContext";
import { useBulbContext } from "../contexts/BulbContext";

export const CTPicker: FC = () => {
  const { bulb } = useBulbContext();
  const apiService = useApiService();
  const [ctState, setCTState] = useState(bulb?.ct);
  useEffect(() => {
    if (!bulb) {
      return;
    }
    setCTState(bulb.ct);
  }, [bulb, bulb?.ct]);

  const handleCTChange = useCallback(
    async (ct: number) => {
      if (!bulb) {
        return;
      }
      setCTState(ct);

      await apiService.setBulbCT(bulb.id, ct, bulb.bright);
    },
    [apiService, bulb]
  );

  if (!bulb) {
    return null;
  }

  return (
    <Row>
      <Col span={8}>
        <Row>
          <Col span={18}>
            <Slider
              style={{ width: "100%" }}
              min={1700}
              max={6500}
              value={ctState}
              onChange={setCTState}
              onAfterChange={handleCTChange}
              disabled={!bulb.status}
            />
          </Col>
          <Col span={1} />
          <Col span={5}>{ctState}</Col>
        </Row>
      </Col>
    </Row>
  );
};
