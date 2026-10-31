
const admin = require('firebase-admin');

async function verify() {
  try {
    console.log('T_START');
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: 'saltwater-electricity-staging',
          clientEmail: 'firebase-adminsdk-fbsvc@saltwater-electricity-staging.iam.gserviceaccount.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmRBNJ+5Y4+ArP\\n574O86FbhaRqxMaTCGgD85HBaFMf1+GE/e4sB8dgR89QFgaGolgQn87tk9rFqjoJ\\nFmyHNQvdxz4DsiftI2X8X/EA4L+PW+yMmnL2NtXYjfB8vt7dqYlVU8Ty6jDoL7U2\\n6gWWVIfQK5BEj88/3PGZrXfeRUk7kyKZucL3ur7EoEPS2HUm0e7luElJ/df1QIHg\\nszceBnjTNX/eKAQRStnkaki5FouKP0NTYz8LoHqz4jWZeRWRJnjQHAojN+/85kyz\\nBYyVM3bjE4Z5k0dkQl9Qe2AOZPbYX4FzuGxd899g6WDkYNVURNxT0Vy4kI3eek28\\ntZBBlcsVAgMBAAECggEAS4SqGjVqow+OoaYJvnLMPGy0JEaiRxBPZlQQRP+kmdcN\\nOMG5l0glN8cGE8MdTbOZOlvLuj8o5BUQbSZBPxxJ+n7P3Q/jcKNeZEYTiimK+Itx\\nIt/YDZsUgFrf+1kakyW5GgeFciwK8LsSnRGoXgKg+V2AFpQXN1OcbQfMZSmlPKg5\\nYh7su0vFmMtm6sNy1HJ6IcLjWlrEgOD1bGRBv8oUc7ltojmv6Vxg1WDev8yJIoHC\\nlbAeBOD8bLrphPtPdBr3+34BZUGpV+2uzkfzhFOIPyG+go6ANyKEO+Gd4oJy4mfw\\nc3UMdkn9jZY+y5r5lO6lBew4cOdjJvPxMVLT3kEhdQKBgQDR95u0NCOzqlccdIfe\\nY7ue0QGAUK520qK0HXHEg3Ap8uoEb4yW+4kYqtKDYt/mtGNjMYJ4QmQiXCovl6W1\\nvWPBV0H7nr6/QL+bBKeCRLmMpoNuS39Q8IjZkcircPniUWYqqoov3yRDtFusi2bW\\nvWrxoP2tKOXJE92h5o/4doHgrwKBgQDKt7xIuhu8VEj3kUaoxYkaMvXiGfJPYQYI\\n4rWFuuqfJsPsgm+vR54u2COFlj0sBTqzIfMLsu1Md+OW7cWKpMZEjZ8GwgYmYBYo\\nhs8Qnal1zWXPim0SEfgnbIQ7gb+xhhkpJD45ghnWUDc340b0lo6QF2CjhRuKrW5S\\n6uGvR45ZewKBgDy3FBBE73n5rNzumYdmYY+oMn3vVrPHbwMUbJx9wYZv1tnXg9j4\\n/YjjhKI3ijVFPmQloeuyjxAchJpkiKeID3uOBueC3Pei+oUSEHor81fHosPXEwbN\\nt1TqwhNJRQj7rsZxsCntpafqVIQNf3xjI7ShcBmNdPzzQKibalBXvHDDAoGBAJ8G\\nzDnxZdiz9hngaaH0dL2MxL9+w0vqPSWzU9t46p23d3OOT7cdY8Yz4Inndk2WPJpS\\nQ6wlzWpzkqLQHGvLH46f2uUeSFzKfBeGyeGrDUlQvFG3siC+4AFta76S5qKJJCvW\\nNso+ea5adzbsoLk3ctcuv60HurdrnmSFxk4OwGkJAoGAVfFTFCMkOqkfN+070si3\\nMaVZrYvh1TiIAhHcxHLtQK2cGaKNAJyYZXFHlCUvlbixLkTA+/m1HijgqbcCN4Rg\\nTxTw0FGCfFu7trBYNAPRqa0I1W/n2QDTxWcfYe/HW7ur1zzUaG4m/orMQNXpH5ux\\nUUBtPhFWOoHlU1Qmvs2sqiE=\\n-----END PRIVATE KEY-----\\n'.replace(/\\n/g, '\n'),
        }),
        databaseURL: 'https://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app/'
      });
    }
    console.log('T_SDK_INIT_DONE');
    
    const db = admin.database();
    
    // Try a very limited read. If it hangs, it's likely a networking/proxy issue.
    const snapshot = await db.ref('accounts').limitToFirst(1).once('value');
    console.log('T_READ_SUCCESS');
    console.log('T_PROJECT_ID: ' + admin.app().options.projectId);
  } catch (error) {
    console.error('T_ERROR: ' + error.message);
    process.exit(1);
  }
}
verify();
