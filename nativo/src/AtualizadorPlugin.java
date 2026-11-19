package tech.vetorial.vetogoshi;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

/** Atualização do próprio app (padrão da suíte Vetorial): baixa com andamento, confere o SHA-256 e abre a instalação quando a pessoa tocar. */
@CapacitorPlugin(name = "Atualizador")
public class AtualizadorPlugin extends Plugin {
    private boolean podeInstalar() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getContext().getPackageManager().canRequestPackageInstalls();
    }

    private void pedirTela() {
        Intent[] opcoes = { new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName())), new Intent(Settings.ACTION_SECURITY_SETTINGS) };
        for (Intent i : opcoes) {
            try { i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); getContext().startActivity(i); return; } catch (Exception e) { /* tenta a próxima */ }
        }
    }

    // ---- Atualização em duas etapas (igual à Vênus): baixar com barra de andamento e instalar quando a pessoa tocar.
    private volatile String atuEstado = "parada";
    private volatile long atuFeitos = 0, atuTotal = 0;
    private volatile String atuErro = "";
    private File atuArquivo = null;

    @PluginMethod
    public void baixarAtualizacao(final PluginCall call) {
        final String url = call.getString("url", "");
        final String sha = call.getString("sha256", "");
        final long tamanho = call.getLong("tamanho", 0L);
        String host = "";
        try { host = new java.net.URL(url).getHost().toLowerCase(java.util.Locale.ROOT); } catch (Exception e) { /* url inválida */ }
        if (!url.startsWith("https://") || !(host.equals("github.com") || host.endsWith(".githubusercontent.com") || host.endsWith(".github.com"))) {
            call.reject("Endereço de atualização não permitido.");
            return;
        }
        if (!podeInstalar()) {
            pedirTela();
            call.reject("Libere “Instalar apps desconhecidos” para este app na tela que abriu e toque em Baixar de novo.");
            return;
        }
        if ("baixando".equals(atuEstado)) { call.resolve(); return; }
        atuEstado = "baixando"; atuFeitos = 0; atuTotal = tamanho; atuErro = ""; atuArquivo = null;
        call.resolve();
        getBridge().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    File apk = new File(getContext().getCacheDir(), "atualizacao.apk");
                    java.net.HttpURLConnection c = (java.net.HttpURLConnection) new java.net.URL(url).openConnection();
                    c.setConnectTimeout(20_000);
                    c.setReadTimeout(60_000);
                    if (c.getResponseCode() != 200) throw new Exception("O download falhou (" + c.getResponseCode() + ").");
                    if (c.getContentLengthLong() > 0) atuTotal = c.getContentLengthLong();
                    java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                    java.io.InputStream in = c.getInputStream();
                    java.io.FileOutputStream out = new java.io.FileOutputStream(apk);
                    try {
                        byte[] b = new byte[64 * 1024];
                        int n;
                        while ((n = in.read(b)) > 0) { out.write(b, 0, n); md.update(b, 0, n); atuFeitos += n; }
                    } finally { out.close(); in.close(); c.disconnect(); }
                    StringBuilder hex = new StringBuilder();
                    for (byte x : md.digest()) hex.append(String.format("%02x", x));
                    if (!sha.isEmpty() && !sha.equalsIgnoreCase(hex.toString())) { apk.delete(); throw new Exception("O arquivo baixado não confere com o publicado. Nada foi instalado."); }
                    atuArquivo = apk;
                    atuEstado = "pronta";
                } catch (Exception e) {
                    atuErro = e.getMessage() == null ? "Não consegui baixar a atualização." : e.getMessage();
                    atuEstado = "erro";
                }
            }
        });
    }

    @PluginMethod
    public void progressoAtualizacao(PluginCall call) {
        JSObject o = new JSObject();
        o.put("estado", atuEstado);
        o.put("feitos", atuFeitos);
        o.put("total", atuTotal);
        o.put("erro", atuErro);
        call.resolve(o);
    }

    @PluginMethod
    public void instalarBaixada(final PluginCall call) {
        final File apk = atuArquivo;
        if (apk == null || !apk.isFile()) { call.reject("Ainda não há atualização baixada."); return; }
        try {
            final android.net.Uri uri = androidx.core.content.FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
            final Intent it = new Intent(Intent.ACTION_VIEW);
            it.setDataAndType(uri, "application/vnd.android.package-archive");
            it.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try { getContext().startActivity(it); call.resolve(); }
                    catch (Exception e) { call.reject("Não consegui abrir a instalação: " + e.getMessage()); }
                }
            });
        } catch (Exception e) {
            call.reject("Não consegui abrir a instalação: " + e.getMessage());
        }
    }
}
