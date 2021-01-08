// FIXME: Implement using process.env for prod!

const staging = {
  cognito: {
    REGION: "us-east-1",
    USER_POOL_ID: "us-east-1_znJUp9ckV",
    APP_CLIENT_ID: "2tnhakq78q65qg7ptuf87d7uh4",
  }
};

// const config = process.env.REACT_APP_STAGE === "prod" ? prod : dev;
const config = staging;

export default {
  ...config
};
