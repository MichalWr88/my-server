export const getJiraNativeWorklogs = async () => {
  return await fetch(decodeURIComponent(   `https://${
    process.env.JIRA_HOST
  }/rest/api/2/issue/CSS-1812/worklog?startAt=2&maxResults=2`)
 ,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JIRA_BEARER}`,
        Accept: "application/json",
      },
    }
  ).then((res) => {
    console.log(res);
    return res;
  });
};
