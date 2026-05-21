import {
  useOidcFetch,
} from "@axa-fr/react-oidc";
import {useEffect, useState} from "react";
import {apiPrefix} from "../configuration";
import { Button, Card, CardBody, CardSubtitle, CardText, CardTitle, Container } from "reactstrap";
import { Link } from "react-router-dom";

interface PoolItem {
  name: string,
  desc: string,
  s3pool: string,
  createdby: string
}

const Home = () => {
  // important hooks
  // const {idToken, idTokenPayload} = useOidcIdToken(); // this is how you get the users id token
  // const {login, logout, isAuthenticated} = useOidc(); // this gets the functions to login and logout and the logout state
  // const {accessTokenPayload} = useOidcAccessToken(); // this contains the user info in raw json format
  // const userInfo = accessTokenPayload as UserInfo;
  const {fetch} = useOidcFetch();

  const [data, setData] = useState<string | null>(null);
  // Just an example of how to get data from an API!
  useEffect(() => {
    let cancelled = false;
    fetch(`${apiPrefix}/demo`)
      .then((res) => res.json())
      .then((res) => {
        if (cancelled) {
          return;
        }
        setData(res.someValue);
      });

    return () => {
      cancelled = true;
    };
  }, [fetch]);

  const testPoolItem: PoolItem = {
    name: "test pool",
    desc: "rah rah rah",
    createdby: "ak",
    s3pool: "bnb-model",
  }

  const [pools, setPools] = useState<PoolItem[]>([testPoolItem]);

  return (
    <div className="flex text-center">
      <h1 className="display-3">Welcome!</h1>
      <p className="lead">
        Current avalible pools:
      </p>
      {!pools && <p>no pools found</p>}
      {pools && <Container>
        {pools.map((pool) => {
          return <Card>
              <CardBody>
                <CardTitle tag="h5">
                  {pool.name}
                </CardTitle>
                <CardSubtitle
                  className="mb-2 text-muted"
                  tag="h6"
                >
                  {"created by "+pool.createdby}
                </CardSubtitle>
                <CardText>
                  {pool.desc}
                </CardText>
                <Button>
                  <Link to="/dashboard">Enter</Link>
                </Button>
              </CardBody>
          </Card>
        })}
      </Container>}
    </div>
  );
};

export default Home;
