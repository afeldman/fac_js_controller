SET VERSION=V8.23-1

for %%f in (*.kl) do (
    echo %%f
    ktrans %%f /ver %VERSION%
)
