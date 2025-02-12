import { Service as ServiceType } from "@/payload-types";
import { format } from "date-fns";

const Mass: React.FC<{ type: ServiceType['type'], time: string }> = ({ type, time }) => {
    const getMassLabel = () => {
      return format(new Date(time), 'HH:mm') + ' - ' + (() => {
        switch (type) {
          case 'sung':
            return 'Msza Św. śpiewana';
          case 'read': 
            return 'Msza Św. czytana';
          case 'silent':
            return 'Msza Św. cicha';
          default:
            return '';
        }
      })();
    };
  
    return <span>{getMassLabel()}</span>;
  };
  
  export default Mass;