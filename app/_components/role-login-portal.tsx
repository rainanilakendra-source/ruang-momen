import type { LoginState } from "../masuk/actions";
import { AuthForm } from "./auth-form";
import { AuthShell } from "./auth-shell";

type LoginAction = (
  state: LoginState,
  formData: FormData,
) => Promise<LoginState>;

export function RoleLoginPortal({
  roleLabel,
  loginAction,
}: {
  roleLabel: "Admin" | "Super Admin";
  loginAction: LoginAction;
}) {
  return (
    <AuthShell
      eyebrow={`${roleLabel} Portal`}
      title={`Masuk sebagai ${roleLabel}`}
      description={`Gunakan akun ${roleLabel} Ruang Momen untuk melanjutkan.`}
    >
      <AuthForm mode="masuk" loginAction={loginAction} />
    </AuthShell>
  );
}
