export const fetchAIRecommendation = async (apiKey: string, prompt: string) => {
    apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || apiKey;
    try {
      // const theBody = JSON.stringify({
      //     model: 'gpt-4o', // You can use another model if you prefer
      //     messages: [
      //       {role: 'user', content: prompt}, // This is the user's input (the prompt)
      //     ],
      //     max_tokens: 500,
      //     temperature: 0.7,
      //   });
      // console.log(theBody);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // You can use another model if you prefer
          messages: [
            {
              role: 'system',
              content: [
                {
                  type: 'text',
                  text: `You are an expert pediatric orthotist. You design orthotic solutions based on clinical and biomechanical data for children with motor disorders such as cerebral palsy.

Your job is to assess a patient's function, range of motion, gait issues, and diagnosis, then recommend:
- The most appropriate orthosis type,
- The rationale for it,
- Specific design parameters (angles, trimlines, straps, materials),
- Footwear modifications,
- Offset values for CAD-based design.

Respond in a structured, professional tone, suitable for orthotic fabrication and clinical communication. Be concise but thorough. Assume the orthosis will be manufactured using 3D CAD/CAM tools.`,
                },
              ],
            },
            {role: 'user', content: prompt}, // This is the user's input (the prompt)
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
  
      // Check if the response is successful
      if (!response.ok) {
        response.text().then(text => {
          // Log the response text or use it for debugging
          console.error('Error Response:', text);
          // throw new Error(`Request failed with status ${response.status}`);
          throw new Error(`Error: ${response.statusText}`);
        });
        //   throw new Error(`Error: ${response.statusText}`);
      }
  
      console.log('========AI Response======');
      console.log(response);
  
      const responseData = await response.json();
      // Check if the response and choices array are defined
      const data = responseData.choices[0].message.content;
      console.log(data);
      return data;
      // const data = await response.json();
      // return data.choices[0].text.trim(); // Return the advice text
    } catch (error) {
      //error handling v1
      console.error('Error fetching AI response:', error);
      return 'Sorry, we could not fetch the AI advice at the moment.';
  
      // // Enhanced error handling
      // console.error('Error fetching AI advice:', error); // Logs the error object
  
      // // Check if error is a response-related error
      // if (error instanceof Response) {
      //   error.text().then(text => {
      //     console.error('Error Response Body:', text);
      //   });
      // } else {
      //   console.error('Error Message:', error.message);
      //   console.error('Error Stack:', error.stack);
      // }
  
      // return 'Sorry, we could not fetch the AI advice at the moment.';
    }
  };