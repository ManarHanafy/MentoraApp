export const EmailService = {
  sendOTP: async (
    targetEmail: string, 
    generatedCode: string, 
    userName: string = 'Mentora User'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`✉️ Sending real OTP email to ${targetEmail} via EmailJS...`);
      
      const payload = {
        service_id: 'service_ihgc31d',
        template_id: 'template_782w2xh',
        user_id: 'pelNhgC_kHNRPMdcx',
        accessToken: 'auZI9JdImYOVrqieGkY_i',
        template_params: {
          to_email: targetEmail,
          email: targetEmail,
          to_name: userName,
          user_name: userName,
          name: userName,
          code: generatedCode,
          otp_code: generatedCode,
          otp: generatedCode,
          message: `Your Mentora verification code is: ${generatedCode}. Please enter this code in the app to complete your authentication.`
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`✅ Email sent successfully to ${targetEmail}!`);
        return { success: true };
      } else {
        const errText = await response.text();
        console.error(`❌ EmailJS dispatch failed:`, errText);
        return { success: false, error: errText || `HTTP Error ${response.status}` };
      }
    } catch (error: any) {
      console.error(`❌ Error in EmailService.sendOTP:`, error);
      return { success: false, error: error.message || 'Network request failed' };
    }
  }
};
