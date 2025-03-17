import { Props } from "next/script";
import { useDocument } from "payloadcms";
export const SendNewsletterButton: React.FC<Props> = (props) => {
  const { path, data } = props;
  
  // You can access any field from the current document
  const documentTitle = data?.title;
  const isNewsletterSent = data?.newsletterSent;
  
  // Use the data in your component
  return (
    <div>
      <p>Document title: {documentTitle}</p>
      <button disabled={isNewsletterSent}>
        {isNewsletterSent ? 'Newsletter Already Sent' : 'Send Newsletter'}
      </button>
    </div>
  );
}