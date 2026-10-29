// Dark wizard: Inno's native controls follow system colors, so each one is set explicitly.
const
  TlkZemin = $000C0B0B;
  TlkPanel = $00121010;
  TlkAlan  = $001A1616;
  TlkMetin = $00D4CDC9;
  TlkVurgu = $00F5F3F2;
  TlkSoluk = $00AAA19B;

procedure TlkKarart(Ana: TWinControl);
var
  I: Integer;
  C: TControl;
begin
  for I := 0 to Ana.ControlCount - 1 do
  begin
    C := Ana.Controls[I];

    if C is TNewStaticText then
    begin
      TNewStaticText(C).Font.Color := TlkMetin;
      TNewStaticText(C).Color := TlkZemin;
    end
    else if C is TLabel then
    begin
      TLabel(C).Font.Color := TlkMetin;
      TLabel(C).Transparent := True;
    end
    else if C is TNewCheckBox then
    begin
      TNewCheckBox(C).Font.Color := TlkMetin;
      TNewCheckBox(C).Color := TlkZemin;
    end
    else if C is TNewRadioButton then
    begin
      TNewRadioButton(C).Font.Color := TlkMetin;
      TNewRadioButton(C).Color := TlkZemin;
    end
    else if C is TNewEdit then
    begin
      TNewEdit(C).Color := TlkAlan;
      TNewEdit(C).Font.Color := TlkVurgu;
    end
    else if C is TNewMemo then
    begin
      TNewMemo(C).Color := TlkAlan;
      TNewMemo(C).Font.Color := TlkMetin;
    end
    else if C is TNewComboBox then
    begin
      TNewComboBox(C).Color := TlkAlan;
      TNewComboBox(C).Font.Color := TlkMetin;
    end
    else if C is TNewListBox then
    begin
      TNewListBox(C).Color := TlkAlan;
      TNewListBox(C).Font.Color := TlkMetin;
    end
    else if C is TNewCheckListBox then
    begin
      TNewCheckListBox(C).Color := TlkAlan;
      TNewCheckListBox(C).Font.Color := TlkMetin;
    end
    else if C is TRichEditViewer then
    begin
      TRichEditViewer(C).Color := TlkAlan;
      TRichEditViewer(C).Font.Color := TlkMetin;
    end
    else if C is TBevel then
    begin
      TBevel(C).Visible := False;
    end
    else if C is TNewNotebookPage then
    begin
      TNewNotebookPage(C).Color := TlkZemin;
    end
    else if C is TPanel then
    begin
      TPanel(C).Color := TlkPanel;
    end;

    if C is TWinControl then
      TlkKarart(TWinControl(C));
  end;
end;

procedure InitializeWizard();
begin
  WizardForm.Color := TlkZemin;
  WizardForm.MainPanel.Color := TlkPanel;
  TlkKarart(WizardForm);
  WizardForm.WelcomeLabel1.Font.Color := TlkVurgu;
  WizardForm.WelcomeLabel2.Font.Color := TlkSoluk;
  WizardForm.PageNameLabel.Font.Color := TlkVurgu;
  WizardForm.PageDescriptionLabel.Font.Color := TlkSoluk;
  WizardForm.FinishedHeadingLabel.Font.Color := TlkVurgu;
  WizardForm.FinishedLabel.Font.Color := TlkSoluk;
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  TlkKarart(WizardForm);
end;
