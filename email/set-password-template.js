module.exports = (name,linkToWebApp,role) => {
    return `
    <!DOCTYPE html>
      <html>
        <head>
          <title>Please confirm your e-mail</title>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <style type="text/css">
            body,
            table,
            td,
            a {
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
            table,
            td {
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
            img {
              -ms-interpolation-mode: bicubic;
            }
            img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
            }
            table {
              border-collapse: collapse !important;
            }
            body {
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            a[x-apple-data-detectors] {
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
            }
            a {
              color: #4D5C84;
              text-decoration: underline;
            }
            * img[tabindex="0"] + div {
              display: none !important;
            }
            @media screen and (max-width: 350px) {
              h1 {
                font-size: 24px !important;
                line-height: 24px !important;
              }
            }
            div[style*="margin: 16px 0;"] {
              margin: 0 !important;
            }
            @media screen and (min-width: 360px) {
              .headingMobile {
                font-size: 40px !important;
              }
              .headingMobileSmall {
                font-size: 28px !important;
              }
            }
          </style>
        </head>
        <body
          bgcolor="#ffffff"
          style="background-color: #ffffff; margin: 0 !important; padding: 0 !important;"
        >
          <center>
            <table
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              align="center"
              valign="top"
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      align="center"
                      valign="top"
                      bgcolor="#ffffff"
                      style="padding: 0 20px !important;max-width: 500px;width: 90%;"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#ffffff"
                            align="center"
                            style="padding: 10px 0 0px 0;"
                          >
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              style="max-width: 500px;border-bottom: 1px solid #e4e4e4 ;"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    bgcolor="#ffffff"
                                    align="left"
                                    valign="middle"
                                    style="padding: 0px; color: #111111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; line-height: 62px;padding:0 0 15px 0; letter-spacing: 1px;"
                                  >
                                    <a
                                      href="${process.env.WEB_APP_DOMAIN}"
                                      target="_blank"
                                      style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;color: #4D5C84;font-size: 30px;font-weight:900;-webkit-font-smoothing:antialiased;text-decoration: none;"
                                      >SmartCargo</a
                                    >
                                  </td>
                                  <td
                                    bgcolor="#ffffff"
                                    align="right"
                                    valign="middle"
                                    style="padding: 0px; color: #111111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; line-height: 48px;padding:0 0 15px 0;"
                                  >
                                    <a
                                      href="${process.env.WEB_APP_DOMAIN}"
                                      target="_blank"
                                      style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;color: #4D5C84;font-size: 12px;font-weight:400;-webkit-font-smoothing:antialiased;text-decoration: none;"
                                      >Login SmartCargo</a
                                    >
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td bgcolor="#ffffff" align="center" style="padding: 0;">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              style="max-width: 500px;border-bottom: 1px solid #e4e4e4;"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    bgcolor="#ffffff"
                                    align="left"
                                    style="padding: 20px 0 0 0; color: #666666; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400;-webkit-font-smoothing:antialiased;"
                                  >
                                    <p
                                      class="headingMobile"
                                      style="margin: 0;color: #171717;font-size: 26px;font-weight: 200;line-height: 130%;margin-bottom:5px;"
                                    >
                                      Password reset
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td height="20"></td>
                                </tr>
                                <tr>
                                  <td
                                    bgcolor="#ffffff"
                                    align="left"
                                    style="padding:0; color: #666666; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400;-webkit-font-smoothing:antialiased;"
                                  >
                                    <p
                                      style="margin:0;color:#585858;font-size:14px;font-weight:400;line-height:170%;"
                                    >
                                      Hi <b>${name}</b>,
                                    </p>
                                    <p
                                      style="margin:0;margin-top:20px;line-height:0;"
                                    ></p>
                                    <p
                                      style="margin:0;color:#585858;font-size:14px;font-weight:400;line-height:170%;"
                                    >
                                      You are now registered as a ${role} with SmartCargo, click the below button to set your password.
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td align="center">
                                    <table
                                      width="100%"
                                      border="0"
                                      cellspacing="0"
                                      cellpadding="0"
                                    >
                                      <tr>
                                        <td
                                          align="center"
                                          style="padding: 33px 0 33px 0;"
                                        >
                                          <table
                                            border="0"
                                            cellspacing="0"
                                            cellpadding="0"
                                            width="100%"
                                          >
                                            <tr>
                                              <td
                                                align="center"
                                                style="border-radius: 4px;"
                                                bgcolor="#4D5C84"
                                              >
                                                <a
                                                  href="${linkToWebApp}"
                                                  style="text-transform:uppercase;background:#4D5C84;font-size: 13px; font-weight: 700; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none !important; padding: 20px 25px; border-radius: 4px; border: 1px solid #4D5C84; display: block;-webkit-font-smoothing:antialiased;"
                                                  target="_blank"
                                                  ><span
                                                    style="color: #ffffff;text-decoration: none;"
                                                    >Set My Password</span
                                                  ></a
                                                >
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    bgcolor="#ffffff"
                                    align="left"
                                    style="padding:0; padding-bottom: 15px; color: #666666; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400;-webkit-font-smoothing:antialiased;"
                                  >
                                    <p
                                      style="margin:0;margin-top:20px;line-height:0;"
                                    ></p>
                                    <p
                                      style="margin:0;color:#585858;font-size:12px;font-weight:400;line-height:170%;"
                                    >
                                      You are receiving this because you email address
                                      was used to create an account in SmartCargo. If you
                                      did not create an account you can safely delete
                                      this email and take no further actions.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td bgcolor="#ffffff" align="center" style="padding: 0;">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              style="max-width: 500px;"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    bgcolor="#ffffff"
                                    align="center"
                                    style="padding: 15px 0 30px 0; color: #666666; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 18px;"
                                  >
                                    <p
                                      style="margin: 0;color: #585858;font-size: 12px;font-weight: 400;-webkit-font-smoothing:antialiased;line-height: 170%;"
                                    >
                                      SmartCargo, Inc.<br />
                                      UCSC Building Complex, 35 Reid Ave, Colombo
                                      00700<br />
                                      Sri Lanka
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </center>
        </body>
      </html>
      `;
  };
  