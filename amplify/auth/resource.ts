import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      saml: {
        name: 'MicrosoftEntraIDSAML',
        metadata: {
          metadataType: 'URL',
          metadataContent:
            //ステージング環境
            //'https://login.microsoftonline.com/92b06829-9d5c-488f-ae9d-c662ec0fd807/federationmetadata/2007-06/federationmetadata.xml?appid=d30a58bc-bbeb-47ae-a55b-15476ee2787d',
            //本番環境
            'https://login.microsoftonline.com/92b06829-9d5c-488f-ae9d-c662ec0fd807/federationmetadata/2007-06/federationmetadata.xml?appid=b88265f5-0903-49da-bc97-a9079daeb315',
        },
        attributeMapping: {
          email:
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          custom: {
            'custom:busho':
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department',
            'custom:displayname':
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/displayname',
          },
        },
      },
      callbackUrls: [
        'http://localhost:3000/',
        'http://localhost:3000',
        'http://localhost:3000/index.html',
        'http://localhost:3000/index.html?',
        'http://localhost:3000/amplify-vue-test/',
        'https://main.dg4wq6dpc31ft.amplifyapp.com/',
      ],
      logoutUrls: [
        'http://localhost:3000/',
        'http://localhost:3000',
        'http://localhost:3000/index.html',
        'http://localhost:3000/login',
        'https://main.dg4wq6dpc31ft.amplifyapp.com',
        'https://main.dg4wq6dpc31ft.amplifyapp.com/login',
      ],
    },
  },
  userAttributes: {
    'custom:busho': {
      dataType: 'String',
      mutable: true,
    },
    'custom:displayname': {
      dataType: 'String',
      mutable: true,
    },
  },
});
