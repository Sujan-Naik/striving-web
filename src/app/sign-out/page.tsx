import { signOut } from "@/auth";
import {redirect} from "next/navigation";

export default function SignOutPage() {
  return (
    <div className={'center-column'}>
      <h5>Are you sure you want to sign out?</h5>
      <form
        action={async () => {
          "use server"
          await signOut({redirectTo: '/login',
})
        }}
      >
          <button type="submit">Sign out</button>
      </form>
    </div>
  )
}