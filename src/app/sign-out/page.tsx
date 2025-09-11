import { signOut } from "@/auth";
//import {HeadedButton, VariantEnum} from "headed-ui";

export default function SignOutPage() {
  return (
    <div>
      <h5>Are you sure you want to sign out?</h5>
      <form
        action={async (formData) => {
          "use server"
          await signOut()
        }}
      >
          {/*<HeadedButton variant={VariantEnum.Primary} type="submit">Sign out</HeadedButton>*/}
          <button type="submit">Sign out</button>
      </form>
    </div>
  )
}