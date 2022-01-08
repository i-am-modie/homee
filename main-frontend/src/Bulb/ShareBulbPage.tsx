import { message, Row, Typography } from "antd";
import { Input } from "../components/molecules/Input";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/atoms/Button";
import { useApiService } from "../contexts/ApiServiceContext";
import { useBulbsContext } from "../contexts/BulbsContext";

export const ShareBulbPage: FC = () => {
  const { id: bulbId } = useParams();
  const { bulbs, refetchBulbs } = useBulbsContext();
  const thisBulb = useMemo(
    () => bulbs.find((it) => it.id === bulbId),
    [bulbs, bulbId]
  );
  const [usernameToShare, setUserNameToShare] = useState<string>("");
  const apiService = useApiService();
  const navigate = useNavigate();

  useEffect(() => {
    setUserNameToShare("");
  }, [thisBulb]);

  const shareBulb = useCallback(async () => {
    try {
      const userToShare = usernameToShare;
      if (!userToShare) {
        return message.error("no username provided");
      }
      await apiService.shareBulb(bulbId!, userToShare);
      await refetchBulbs();
      message.success(`Shared bulb with: ${userToShare}`);
      setUserNameToShare("");
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        message.error(err.message ?? "Unknown Error");
        return;
      }
      message.error("Unknown Error");
    }
  }, [apiService, bulbId, refetchBulbs, usernameToShare]);

  const unshareBulb = useCallback(
    async (username: string) => {
      try {
        if (!username) {
          return message.error("no username provided");
        }
        await apiService.unshareBulb(bulbId!, username);
        await refetchBulbs();
        message.success(`Unshared bulb with: ${username}`);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
          message.error(err.message ?? "Unknown Error");
          return;
        }
        message.error("Unknown Error");
      }
    },
    [apiService, bulbId, refetchBulbs]
  );

  if (!bulbId) {
    navigate(-1);
    return null;
  }

  return (
    <div>
      <Typography.Title>
        Share {thisBulb?.name || thisBulb?.id}
      </Typography.Title>
      <Input
        value={usernameToShare}
        onChange={(e) => setUserNameToShare(e.target.value)}
      />
      <Button onClick={shareBulb}>Set Name</Button>

      <Typography.Title>This bulb is shared with</Typography.Title>
      {thisBulb?.sharedWith.map((user) => (
        <Row>
          {user} <Button onClick={() => unshareBulb(user)}>Unshare</Button>
        </Row>
      ))}
    </div>
  );
};
