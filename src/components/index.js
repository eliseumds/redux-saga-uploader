import React from 'react';
import { Grid } from 'react-bootstrap';
import MyUploader from './MyUploader';
import AvatarUploader from './AvatarUploader';

export default function Uploader() {
  return (
    <Grid>
      <MyUploader
        mode="multiple"
        id="testUploader"
        collection="brand-logo"
        initialObjects={[
          {
            id: 'abc123',
            name: 'fromServer.png',
            cdnUrl: 'http://www.thebakerymadewithlove.com/wp-content/uploads/2014/08/placeholder.png',
            isUploaded: true
          }
        ]}
      />
      <hr />
      <AvatarUploader id="testAvatarUploader" collection="avatar" />
    </Grid>
  );
}
