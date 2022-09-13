import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import { boolStr, readableBytes, readableDuration } from '../utils/utils';

/** TODO: make VideoDetails type */
type Props = {
  details: Record<string, any>;
};

/**
 * @return {string}
 */
function Error(prop: any) {
  const { detail } = prop;
  if (!detail) return <></>;
  const { error } = detail;
  if (!error) return <></>;
  return (
    <Alert variant="warning">
      <h6>
        {' '}
        Error: {error.code} - {error.details}
      </h6>
    </Alert>
  );
}

/**
 * @return {string}
 */
function CommercialSkip(prop: any) {
  const { detail } = prop;
  if (!detail) return <></>;
  const { comskip } = detail;
  if (!comskip) return <></>;
  return (
    <h6>
      Commercial Skip status: <b>{comskip.state}</b>{' '}
      {comskip.error ? `(${comskip.error})` : ''}
    </h6>
  );
}

function VideoDetail(props: Props) {
  const { details } = props;
  return (
    <Table size="sm" className="pb-0 mb-0">
      <tbody>
        <tr>
          <th>Audio</th>
          <td>{details.audio}</td>
          <th>Clean?</th>
          <td>{boolStr(details.clean)}</td>
          <th>Cloud?</th>
          <td>{boolStr(details.cloud)}</td>
        </tr>
        <tr>
          <th>Size</th>
          <td>
            {readableBytes(details.size)} &nbsp; (
            {readableDuration(details.duration)})
          </td>
        </tr>
        <tr>
          <th>Dimensions</th>
          <td>
            {details.width}x{details.height}
          </td>
          <th>uploading?</th>
          <td>{boolStr(details.uploading)}</td>
        </tr>
        <tr>
          <td colSpan={6}>
            <CommercialSkip detail={details} />
            <Error detail={details} />
          </td>
        </tr>
      </tbody>
    </Table>
  );
}

export default VideoDetail;
