import { ParentReports } from '../parent/ParentReports';

export const StudentReports = ({ data }: any) => {
  // Reusing the ParentReports component as the data and layout are exactly what the user requested for students too.
  return <ParentReports studentIdProp={data?.id} />;
};
