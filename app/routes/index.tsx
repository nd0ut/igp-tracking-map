import { useRecoilValue } from "recoil";
import { userAtom } from "~/store/userAtom";

export default function Index() {
  const user = useRecoilValue(userAtom)

  return (
    <div>
      <div>{user ? JSON.stringify(user, null, 2) : "пшёл нахуй пидор"}</div>
      <div>
        {!user && (
          <form action="/auth/auth0" method="post">
            <button>Login with Auth0</button>
          </form>
        )}
      </div>
    </div>
  );
}
