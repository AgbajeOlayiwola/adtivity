// src/components/MultiStepForm.tsx

"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { z } from "zod"
import TwitterStepOne from "./twitterStep1"

const loginSchema = z.object({
  userName: z.string().min(1, { message: "Username cannot be empty." }),
})

type LoginFormValues = z.infer<typeof loginSchema>
interface MultiStepFormProps {
  onClose: () => void
}

const MultiStepForm = ({ onClose }: MultiStepFormProps) => {
  const [step, setStep] = useState(1)

  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)

  const renderStep = () => {
    switch (step) {
      case 1:
        return <TwitterStepOne onClose={onClose} />
      case 2:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 2: Verification</h2>
            <p>This is the second step. Add verification fields here.</p>
            {/* Add your form fields for step 2 */}
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 3: Confirmation</h2>
            <p>This is the final step. Review and submit.</p>
            {/* Add a summary of the form data here */}
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              {/* <Button onClick={onClose}>Finish</Button> */}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Twitter Account</h1>
      {renderStep()}
    </div>
  )
}

export { MultiStepForm }
