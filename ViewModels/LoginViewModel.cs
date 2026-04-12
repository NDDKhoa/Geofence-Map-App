using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using MauiApp1.Services;

namespace MauiApp1.ViewModels;

public sealed class LoginViewModel : INotifyPropertyChanged
{
    private readonly AuthService _auth;
    private readonly INavigationService _nav;

    private string _email = "";
    private string _password = "";
    private bool _isBusy;
    private string? _errorMessage;

    public LoginViewModel(AuthService auth, INavigationService nav)
    {
        _auth = auth;
        _nav = nav;
        LoginCommand = new Command(ExecuteLogin, () => !IsBusy);
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    public string Email
    {
        get => _email;
        set
        {
            if (_email == value) return;
            _email = value;
            OnPropertyChanged();
        }
    }

    public string Password
    {
        get => _password;
        set
        {
            if (_password == value) return;
            _password = value;
            OnPropertyChanged();
        }
    }

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
            (LoginCommand as Command)?.ChangeCanExecute();
        }
    }

    public bool IsNotBusy => !IsBusy;

    public string? ErrorMessage
    {
        get => _errorMessage;
        set
        {
            if (_errorMessage == value) return;
            _errorMessage = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(HasError));
        }
    }

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);

    public ICommand LoginCommand { get; }

    private void ExecuteLogin()
    {
        if (IsBusy) return;
        _ = LoginCoreAsync();
    }

    private async Task LoginCoreAsync()
    {
        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var (ok, err) = await _auth.LoginAsync(Email, Password).ConfigureAwait(false);

            await MainThread.InvokeOnMainThreadAsync(() =>
            {
                if (!ok)
                {
                    ErrorMessage = err;
                    return;
                }

                Password = "";
                OnPropertyChanged(nameof(Password));
            }).ConfigureAwait(false);

            if (ok)
                await _nav.PopModalAsync().ConfigureAwait(false);
        }
        finally
        {
            await MainThread.InvokeOnMainThreadAsync(() => IsBusy = false).ConfigureAwait(false);
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
